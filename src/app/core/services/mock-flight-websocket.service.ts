import { Injectable } from '@angular/core';
import { Observable, Subject, interval, map, merge, shareReplay } from 'rxjs';
import { Flight } from '../models/flight.model';

/** Mock WebSocket stream: JSON payloads mirroring a live feed */
export interface FlightSocketMessage {
  type: 'SNAPSHOT' | 'UPDATE';
  flights: Flight[];
  serverTime: string;
}

@Injectable({ providedIn: 'root' })
export class MockFlightWebSocketService {
  private readonly hub = new Subject<FlightSocketMessage>();

  /** Push a message as if received from the server */
  emit(message: FlightSocketMessage): void {
    this.hub.next(message);
  }

  /** Client-side stream with periodic heartbeat + manual emits */
  asObservable(flights$: Observable<Flight[]>): Observable<FlightSocketMessage> {
    const heartbeats = interval(5000).pipe(
      map(() => ({ type: 'UPDATE' as const, flights: [] as Flight[], serverTime: new Date().toISOString() }))
    );
    return merge(
      this.hub.asObservable(),
      flights$.pipe(
        map((flights) => ({
          type: 'SNAPSHOT' as const,
          flights,
          serverTime: new Date().toISOString(),
        }))
      ),
      heartbeats
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
