export type FlightStatus =
  | 'Scheduled'
  | 'Boarding'
  | 'Departed'
  | 'Enroute'
  | 'Delayed'
  | 'Landed';

export interface Airport {
  iata: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  aircraftType: string;
  departure: Airport;
  destination: Airport;
  firRegion: string;
  latitude: number;
  longitude: number;
  altitudeFt: number;
  speedKts: number;
  status: FlightStatus;
  eta: Date;
  lastUpdated: Date;
  /** Planned arrival for delay detection */
  scheduledArrival: Date;
  /** Progress 0–1 along route */
  routeProgress: number;
  /** Optional narrative for comm logs */
  callSign: string;
}

export interface FlightTimelineEvent {
  label: string;
  at: Date;
  detail?: string;
}

export interface DelayRecord {
  at: Date;
  minutes: number;
  reason: string;
}

export interface CommunicationLogEntry {
  at: Date;
  channel: string;
  message: string;
  direction: 'IN' | 'OUT';
}

export interface FlightDetailExtras {
  timeline: FlightTimelineEvent[];
  delayHistory: DelayRecord[];
  communicationLogs: CommunicationLogEntry[];
}

export type AlertType = 'ALTITUDE_DROP' | 'SPEED_EXCEEDED' | 'DELAY';

export interface FlightAlert {
  id: string;
  flightId: string;
  type: AlertType;
  message: string;
  at: Date;
  severity: 'warning' | 'critical';
}
