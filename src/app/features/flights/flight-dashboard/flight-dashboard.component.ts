import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { Flight, FlightStatus } from '../../../core/models/flight.model';
import { FlightSimulationService } from '../../../core/services/flight-simulation.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-flight-dashboard',
  templateUrl: './flight-dashboard.component.html',
  styleUrls: ['./flight-dashboard.component.scss'],
})
export class FlightDashboardComponent implements OnInit, OnDestroy {
  readonly displayedColumns: string[] = [
    'id',
    'aircraftType',
    'departure',
    'destination',
    'firRegion',
    'latitude',
    'longitude',
    'altitudeFt',
    'speedKts',
    'status',
    'eta',
    'lastUpdated',
    'actions',
  ];

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly statusControl = new FormControl<FlightStatus | ''>('', { nonNullable: true });
  readonly aircraftControl = new FormControl<string>('', { nonNullable: true });
  readonly firControl = new FormControl<string>('', { nonNullable: true });

  readonly dataSource = new MatTableDataSource<Flight>([]);
  readonly permissions = this.auth.permissions();

  /** Flights after search + filters (for map + table) */
  filteredFlights$: Observable<Flight[]>;
  private sub?: Subscription;

  readonly statusOptions: FlightStatus[] = [
    'Scheduled',
    'Boarding',
    'Departed',
    'Enroute',
    'Delayed',
    'Landed',
  ];

  constructor(
    private readonly simulation: FlightSimulationService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    const status$ = this.statusControl.valueChanges.pipe(
      startWith(this.statusControl.value)
    );
    const aircraft$ = this.aircraftControl.valueChanges.pipe(
      startWith(this.aircraftControl.value)
    );
    const fir$ = this.firControl.valueChanges.pipe(startWith(this.firControl.value));

    this.filteredFlights$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        combineLatest([
          this.simulation.flights$,
          status$,
          aircraft$,
          fir$,
        ]).pipe(
          map(([flights, status, aircraft, fir]) =>
            this.applyFilters(flights, term, status, aircraft, fir)
          )
        )
      )
    );
  }

  ngOnInit(): void {
    this.sub = this.filteredFlights$.subscribe((rows) => {
      this.dataSource.data = rows;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  trackByFlightId(_index: number, flight: Flight): string {
    return flight.id;
  }

  openDetail(flight: Flight): void {
    void this.router.navigate(['/flights/flight', flight.id]);
  }

  quickStatusUpdate(flight: Flight, status: FlightStatus): void {
    if (!this.permissions.canUpdateFlightStatus) {
      this.snackBar.open('Your role cannot update flight status.', 'OK', { duration: 3000 });
      return;
    }
    this.simulation.updateStatus(flight.id, status);
  }

  statusClass(status: FlightStatus): string {
    const map: Record<FlightStatus, string> = {
      Scheduled: 'st-scheduled',
      Boarding: 'st-boarding',
      Departed: 'st-departed',
      Enroute: 'st-enroute',
      Delayed: 'st-delayed',
      Landed: 'st-landed',
    };
    return map[status] ?? '';
  }

  private applyFilters(
    flights: Flight[],
    term: string,
    status: FlightStatus | '',
    aircraft: string,
    fir: string
  ): Flight[] {
    const q = term.trim().toLowerCase();
    return flights.filter((f) => {
      const matchesTerm =
        !q ||
        f.id.toLowerCase().includes(q) ||
        f.departure.iata.toLowerCase().includes(q) ||
        f.destination.iata.toLowerCase().includes(q) ||
        f.departure.name.toLowerCase().includes(q) ||
        f.destination.name.toLowerCase().includes(q) ||
        f.firRegion.toLowerCase().includes(q);
      const matchesStatus = !status || f.status === status;
      const matchesAircraft =
        !aircraft || f.aircraftType.toLowerCase().includes(aircraft.toLowerCase());
      const matchesFir =
        !fir || f.firRegion.toLowerCase().includes(fir.toLowerCase());
      return matchesTerm && matchesStatus && matchesAircraft && matchesFir;
    });
  }
}
