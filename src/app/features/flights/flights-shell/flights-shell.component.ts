import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { FlightAlert } from '../../../core/models/flight.model';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { FlightSimulationService } from '../../../core/services/flight-simulation.service';
import { MockFlightWebSocketService } from '../../../core/services/mock-flight-websocket.service';
import { UserRole } from '../../../core/models/role.model';

@Component({
  selector: 'app-flights-shell',
  templateUrl: './flights-shell.component.html',
  styleUrls: ['./flights-shell.component.scss'],
})
export class FlightsShellComponent implements OnInit, OnDestroy {
  readonly roles: UserRole[] = ['supervisor', 'controller', 'viewer'];
  selectedRole: UserRole = 'supervisor';
  alertCount = 0;
  /** Recent alerts for menu (newest first) */
  recentAlerts: FlightAlert[] = [];
  private sub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    readonly auth: AuthService,
    private readonly alerts: AlertService,
    private readonly simulation: FlightSimulationService,
    private readonly mockWs: MockFlightWebSocketService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.selectedRole = this.auth.getRole();
    this.sub = this.alerts.alerts$.subscribe((list) => {
      this.recentAlerts = list.slice(0, 20);
      this.alertCount = list.length;
    });
    this.sub.add(
      this.simulation.flights$.subscribe((flights) =>
        this.mockWs.emit({
          type: 'SNAPSHOT',
          flights,
          serverTime: new Date().toISOString(),
        })
      )
    );
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => undefined);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.sub?.unsubscribe();
  }

  onRoleChange(role: UserRole): void {
    this.auth.setRole(role);
    this.selectedRole = role;
  }

  clearAlerts(): void {
    this.alerts.clear();
  }

  dismissAlert(id: string, event?: Event): void {
    event?.stopPropagation();
    this.alerts.dismiss(id);
  }
}
