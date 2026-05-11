import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlightAlert } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly alertsSubject = new BehaviorSubject<FlightAlert[]>([]);

  readonly alerts$: Observable<FlightAlert[]> = this.alertsSubject.asObservable();

  constructor(private readonly snackBar: MatSnackBar) {}

  unreadCount(): number {
    return this.alertsSubject.value.length;
  }

  pushAlert(alert: FlightAlert): void {
    const next = [alert, ...this.alertsSubject.value].slice(0, 50);
    this.alertsSubject.next(next);
    const panelClass =
      alert.severity === 'critical' ? ['snackbar-critical'] : ['snackbar-warning'];
    this.snackBar.open(alert.message, 'Dismiss', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass,
    });
  }

  clear(): void {
    this.alertsSubject.next([]);
  }

  dismiss(id: string): void {
    this.alertsSubject.next(this.alertsSubject.value.filter((a) => a.id !== id));
  }
}
