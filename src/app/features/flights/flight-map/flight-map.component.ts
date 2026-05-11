import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import * as L from 'leaflet';
import { Flight, FlightStatus } from '../../../core/models/flight.model';

const STATUS_COLOR: Record<FlightStatus, string> = {
  Scheduled: '#5c6bc0',
  Boarding: '#039be5',
  Departed: '#00897b',
  Enroute: '#3949ab',
  Delayed: '#fb8c00',
  Landed: '#43a047',
};

@Component({
  selector: 'app-flight-map',
  template: '<div #mapEl class="map-host"></div>',
  styleUrls: ['./flight-map.component.scss'],
})
export class FlightMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  @Input() flights: Flight[] | null = [];

  private map?: L.Map;
  private readonly markers = new Map<string, L.CircleMarker>();
  private readonly routes = new Map<string, L.Polyline>();
  private didFitBounds = false;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      worldCopyJump: true,
    }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 0);
    this.render(this.flights ?? []);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flights'] && this.map) {
      this.render(this.flights ?? []);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
    this.markers.clear();
    this.routes.clear();
  }

  private render(flights: Flight[]): void {
    if (!this.map) return;

    const activeIds = new Set(flights.map((f) => f.id));

    for (const [id, marker] of this.markers) {
      if (!activeIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }
    for (const [id, line] of this.routes) {
      if (!activeIds.has(id)) {
        line.remove();
        this.routes.delete(id);
      }
    }

    const bounds: L.LatLngTuple[] = [];

    for (const f of flights) {
      const latlng: L.LatLngTuple = [f.latitude, f.longitude];
      bounds.push(latlng);

      const color = STATUS_COLOR[f.status] ?? '#546e7a';
      let line = this.routes.get(f.id);
      const routeLatLngs: L.LatLngExpression[] = [
        [f.departure.lat, f.departure.lng],
        [f.destination.lat, f.destination.lng],
      ];
      if (!line) {
        line = L.polyline(routeLatLngs, { color, weight: 2, opacity: 0.55, dashArray: '6 4' });
        line.addTo(this.map);
        this.routes.set(f.id, line);
      } else {
        line.setLatLngs(routeLatLngs);
        line.setStyle({ color });
      }

      let marker = this.markers.get(f.id);
      if (!marker) {
        marker = L.circleMarker(latlng, {
          radius: 9,
          color: '#263238',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
        });
        marker.addTo(this.map);
        marker.on('click', () => marker?.bindPopup(this.popupHtml(f)).openPopup());
        this.markers.set(f.id, marker);
      } else {
        marker.setLatLng(latlng);
        marker.setStyle({ fillColor: color, color: '#263238' });
        marker.off('click');
        marker.on('click', () => marker?.bindPopup(this.popupHtml(f)).openPopup());
      }
    }

    if (bounds.length && !this.didFitBounds) {
      this.map.fitBounds(L.latLngBounds(bounds), {
        padding: [32, 32],
        maxZoom: 5,
      });
      this.didFitBounds = true;
    }
  }

  private popupHtml(f: Flight): string {
    const route = `${f.departure.iata} → ${f.destination.iata}`;
    return `
      <div style="min-width:180px;font-family:Roboto,sans-serif;font-size:13px;">
        <strong>${f.id}</strong><br/>
        <span>Route: ${route}</span><br/>
        <span>Speed: ${Math.round(f.speedKts)} kts</span><br/>
        <span>Alt: ${Math.round(f.altitudeFt)} ft</span><br/>
        <span>Status: ${f.status}</span>
      </div>`;
  }
}
