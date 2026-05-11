import { Airport } from '../models/flight.model';

export const AIRPORTS: Record<string, Airport> = {
  JFK: { iata: 'JFK', name: 'John F. Kennedy Intl', lat: 40.6398, lng: -73.7789 },
  LAX: { iata: 'LAX', name: 'Los Angeles Intl', lat: 33.9425, lng: -118.4081 },
  ORD: { iata: 'ORD', name: "Chicago O'Hare Intl", lat: 41.9742, lng: -87.9073 },
  LHR: { iata: 'LHR', name: 'London Heathrow', lat: 51.47, lng: -0.4543 },
  DXB: { iata: 'DXB', name: 'Dubai Intl', lat: 25.2532, lng: 55.3657 },
  SIN: { iata: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915 },
  SYD: { iata: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9461, lng: 151.1772 },
  FRA: { iata: 'FRA', name: 'Frankfurt Main', lat: 50.0379, lng: 8.5622 },
  BOM: { iata: 'BOM', name: 'Mumbai Chhatrapati Shivaji', lat: 19.0896, lng: 72.8656 },
  NRT: { iata: 'NRT', name: 'Tokyo Narita', lat: 35.7647, lng: 140.3864 },
};

export function firForPosition(lat: number, lng: number): string {
  if (lng >= -130 && lng < -60) return 'NAM West';
  if (lng >= -60 && lng < -20) return 'CAR SAM';
  if (lng >= -20 && lng < 25) return 'EUR West';
  if (lng >= 25 && lng < 60) return 'MID East';
  if (lng >= 60 && lng < 100) return 'South Asia';
  if (lng >= 100 && lng < 145) return 'SEA FIR';
  if (lng >= 145 || lng < -130) return 'PAC East';
  return 'Oceanic';
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
