import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { AIRPORTS, firForPosition, lerp } from '../data/airports.data';
import {
  CommunicationLogEntry,
  DelayRecord,
  Flight,
  FlightDetailExtras,
  FlightStatus,
  FlightTimelineEvent,
} from '../models/flight.model';
import { AlertService } from './alert.service';

interface InternalFlight extends Flight {
  cruiseAlt: number;
  delayed: boolean;
  delayAlertSent: boolean;
  speedAlertSent: boolean;
  lastAlt: number;
}

function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60_000);
}

function statusForProgress(p: number, delayed: boolean): FlightStatus {
  if (p >= 0.97) return 'Landed';
  if (p >= 0.12 && delayed) return 'Delayed';
  if (p >= 0.12) return 'Enroute';
  if (p >= 0.05) return 'Departed';
  if (p >= 0.01) return 'Boarding';
  return 'Scheduled';
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

@Injectable({ providedIn: 'root' })
export class FlightSimulationService {
  private readonly flightsSubject = new BehaviorSubject<Flight[]>([]);
  private readonly detailsCache = new Map<string, FlightDetailExtras>();
  private internal: InternalFlight[] = [];
  private sub?: Subscription;
  private tickCount = 0;

  readonly flights$: Observable<Flight[]> = this.flightsSubject.asObservable();

  constructor(private readonly alerts: AlertService) {
    this.resetFleet();
    this.sub = interval(2500).subscribe(() => this.tick());
  }

  getFlight(id: string): Flight | undefined {
    return this.internal.find((f) => f.id === id);
  }

  getDetailExtras(id: string): FlightDetailExtras {
    if (!this.detailsCache.has(id)) {
      this.detailsCache.set(id, this.buildExtras(id));
    }
    return this.detailsCache.get(id)!;
  }

  /** Controller / supervisor: force status for demo */
  updateStatus(id: string, status: FlightStatus): void {
    const f = this.internal.find((x) => x.id === id);
    if (!f) return;
    f.status = status;
    f.lastUpdated = new Date();
    this.emit();
  }

  private resetFleet(): void {
    const routes: { dep: string; dest: string; type: string; id: string; call: string }[] = [
      { id: 'FLT-101', dep: 'JFK', dest: 'LHR', type: 'B787-9', call: 'RAM101' },
      { id: 'FLT-204', dep: 'LAX', dest: 'NRT', type: 'A350-900', call: 'RAM204' },
      { id: 'FLT-310', dep: 'ORD', dest: 'FRA', type: 'B777-300ER', call: 'RAM310' },
      { id: 'FLT-415', dep: 'DXB', dest: 'SIN', type: 'A380-800', call: 'RAM415' },
      { id: 'FLT-502', dep: 'SYD', dest: 'BOM', type: 'B787-8', call: 'RAM502' },
      { id: 'FLT-633', dep: 'LHR', dest: 'JFK', type: 'A330-300', call: 'RAM633' },
      { id: 'FLT-701', dep: 'SIN', dest: 'SYD', type: 'A350-900', call: 'RAM701' },
      { id: 'FLT-808', dep: 'BOM', dest: 'DXB', type: 'B737-8', call: 'RAM808' },
    ];

    this.internal = routes.map((r, idx) => {
      const dep = AIRPORTS[r.dep];
      const dest = AIRPORTS[r.dest];
      const progress = (idx * 0.11) % 0.94;
      const delayed = idx % 3 === 0;
      const scheduledArrival = addMinutes(new Date(), 120 + idx * 15);
      const eta = delayed ? addMinutes(scheduledArrival, 40) : addMinutes(scheduledArrival, -20 + idx * 5);
      const f: InternalFlight = {
        id: r.id,
        aircraftType: r.type,
        departure: dep,
        destination: dest,
        firRegion: firForPosition(lerp(dep.lat, dest.lat, progress), lerp(dep.lng, dest.lng, progress)),
        latitude: lerp(dep.lat, dest.lat, progress),
        longitude: lerp(dep.lng, dest.lng, progress),
        altitudeFt: 8000 + progress * 32000 + randomBetween(-500, 500),
        speedKts: 280 + progress * 200 + randomBetween(-15, 15),
        status: statusForProgress(progress, delayed),
        eta,
        lastUpdated: new Date(),
        scheduledArrival,
        routeProgress: progress,
        callSign: r.call,
        cruiseAlt: 34000 + ((idx * 700) % 4000),
        delayed,
        delayAlertSent: false,
        speedAlertSent: false,
        lastAlt: 0,
      };
      f.lastAlt = f.altitudeFt;
      this.detailsCache.delete(f.id);
      return f;
    });
    this.emit();
  }

  private tick(): void {
    this.tickCount += 1;
    for (const f of this.internal) {
      f.lastUpdated = new Date();
      const prevAlt = f.altitudeFt;
      const prevSpeed = f.speedKts;
      const prevProgress = f.routeProgress;

      let delta = randomBetween(0.008, 0.022);
      if (f.status === 'Landed') {
        f.routeProgress = 0;
        f.delayed = Math.random() > 0.65;
        f.delayAlertSent = false;
        f.speedAlertSent = false;
        f.scheduledArrival = addMinutes(new Date(), 90 + Math.floor(Math.random() * 60));
        f.eta = f.delayed ? addMinutes(f.scheduledArrival, 45) : addMinutes(f.scheduledArrival, -10);
        f.latitude = f.departure.lat;
        f.longitude = f.departure.lng;
        f.altitudeFt = 0;
        f.speedKts = 0;
        f.status = 'Scheduled';
        f.lastAlt = 0;
        continue;
      }

      f.routeProgress = Math.min(0.999, f.routeProgress + delta);
      f.latitude = lerp(f.departure.lat, f.destination.lat, f.routeProgress);
      f.longitude = lerp(f.departure.lng, f.destination.lng, f.routeProgress);
      f.firRegion = firForPosition(f.latitude, f.longitude);

      const cruise = f.cruiseAlt;
      const altWave = Math.sin(this.tickCount / 3 + f.id.charCodeAt(4)) * 1200;
      f.altitudeFt = Math.max(
        0,
        Math.min(cruise + 4000, cruise * (0.25 + 0.75 * Math.min(1, f.routeProgress * 1.2)) + altWave)
      );

      f.speedKts = Math.max(0, 240 + f.routeProgress * 240 + randomBetween(-25, 25));

      // Simulated hazard: sudden drop
      if (f.routeProgress > 0.15 && f.routeProgress < 0.85 && Math.random() > 0.92) {
        f.altitudeFt -= 4500;
      }

      // Speed spike
      if (f.routeProgress > 0.2 && f.routeProgress < 0.8 && this.tickCount % 11 === 0 && f.id.endsWith('4')) {
        f.speedKts += 120;
      }

      f.status = statusForProgress(f.routeProgress, f.delayed);
      const remaining = 1 - f.routeProgress;
      f.eta = addMinutes(new Date(), Math.max(5, remaining * 180 + (f.delayed ? 35 : 0)));

      // Alerts
      if (prevAlt - f.altitudeFt > 2500 && f.routeProgress > 0.1) {
        this.alerts.pushAlert({
          id: `${f.id}-alt-${Date.now()}`,
          flightId: f.id,
          type: 'ALTITUDE_DROP',
          message: `${f.id}: Sudden altitude drop detected (${Math.round(prevAlt)} → ${Math.round(f.altitudeFt)} ft)`,
          at: new Date(),
          severity: 'critical',
        });
      }

      if (f.speedKts > 520 && !f.speedAlertSent) {
        f.speedAlertSent = true;
        this.alerts.pushAlert({
          id: `${f.id}-spd-${Date.now()}`,
          flightId: f.id,
          type: 'SPEED_EXCEEDED',
          message: `${f.id}: Speed threshold exceeded (${Math.round(f.speedKts)} kts)`,
          at: new Date(),
          severity: 'warning',
        });
      }

      const delayMin =
        (f.eta.getTime() - f.scheduledArrival.getTime()) / 60_000;
      if (delayMin > 30 && !f.delayAlertSent) {
        f.delayAlertSent = true;
        this.alerts.pushAlert({
          id: `${f.id}-dly-${Date.now()}`,
          flightId: f.id,
          type: 'DELAY',
          message: `${f.id}: Delay exceeds 30 minutes (~${Math.round(delayMin)} min)`,
          at: new Date(),
          severity: 'warning',
        });
      }

      f.lastAlt = f.altitudeFt;

      // Refresh cached narrative when flight completes a leg
      if (prevProgress < 0.97 && f.routeProgress >= 0.97) {
        this.detailsCache.delete(f.id);
      }
    }
    this.emit();
  }

  private emit(): void {
    this.flightsSubject.next(this.internal.map((x) => this.toPublic(x)));
  }

  private toPublic(f: InternalFlight): Flight {
    return {
      id: f.id,
      aircraftType: f.aircraftType,
      departure: f.departure,
      destination: f.destination,
      firRegion: f.firRegion,
      latitude: f.latitude,
      longitude: f.longitude,
      altitudeFt: f.altitudeFt,
      speedKts: f.speedKts,
      status: f.status,
      eta: f.eta,
      lastUpdated: f.lastUpdated,
      scheduledArrival: f.scheduledArrival,
      routeProgress: f.routeProgress,
      callSign: f.callSign,
    };
  }

  private buildExtras(id: string): FlightDetailExtras {
    const f = this.internal.find((x) => x.id === id);
    const now = new Date();
    const timeline: FlightTimelineEvent[] = [
      { label: 'Scheduled departure', at: addMinutes(now, -120), detail: f?.departure.iata },
      { label: 'Boarding', at: addMinutes(now, -90), detail: 'Gate assignment' },
      { label: 'Pushback & start', at: addMinutes(now, -75), detail: 'Taxi clearance' },
      { label: 'Takeoff', at: addMinutes(now, -60), detail: 'RWY active' },
      { label: 'Climb', at: addMinutes(now, -45), detail: 'FL180' },
      { label: 'Cruise', at: addMinutes(now, -20), detail: `FL${Math.round((f?.cruiseAlt ?? 36000) / 100)}` },
    ];
    const delayHistory: DelayRecord[] = f?.delayed
      ? [
          { at: addMinutes(now, -40), minutes: 12, reason: 'ATC flow' },
          { at: addMinutes(now, -25), minutes: 38, reason: 'Weather deviation' },
        ]
      : [{ at: addMinutes(now, -200), minutes: 6, reason: 'Late inbound aircraft' }];
    const communicationLogs: CommunicationLogEntry[] = [
      { at: addMinutes(now, -55), channel: 'TWR', message: 'Cleared for takeoff', direction: 'OUT' },
      { at: addMinutes(now, -54), channel: 'TWR', message: 'Wind calm, runway dry', direction: 'IN' },
      { at: addMinutes(now, -30), channel: 'ACC', message: 'Climb FL340', direction: 'OUT' },
      { at: addMinutes(now, -28), channel: 'ACC', message: 'Roger, climbing FL340', direction: 'IN' },
    ];
    return { timeline, delayHistory, communicationLogs };
  }
}
