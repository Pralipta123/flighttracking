import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flight, FlightDetailExtras, FlightStatus } from '../../../core/models/flight.model';
import { FlightSimulationService } from '../../../core/services/flight-simulation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.scss'],
})
export class FlightDetailComponent implements OnInit, OnDestroy {
  flight?: Flight;
  extras?: FlightDetailExtras;
  readonly statusOptions: FlightStatus[] = [
    'Scheduled',
    'Boarding',
    'Departed',
    'Enroute',
    'Delayed',
    'Landed',
  ];
  readonly permissions = this.auth.permissions();
  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly simulation: FlightSimulationService,
    private readonly auth: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([this.route.paramMap, this.simulation.flights$])
      .pipe(
        map(([params, flights]) => {
          const id = params.get('id');
          return flights.find((f) => f.id === id);
        })
      )
      .subscribe((f) => {
        this.flight = f;
        if (f) {
          this.extras = this.simulation.getDetailExtras(f.id);
        } else {
          this.extras = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyStatus(status: FlightStatus): void {
    if (!this.flight) return;
    if (!this.permissions.canUpdateFlightStatus) {
      this.snackBar.open('Your role cannot update flight status.', 'OK', { duration: 3000 });
      return;
    }
    this.simulation.updateStatus(this.flight.id, status);
  }
}
