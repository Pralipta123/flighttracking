import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole, RolePermissions } from '../models/role.model';

const PERMISSIONS: Record<UserRole, RolePermissions> = {
  supervisor: {
    canViewDashboard: true,
    canViewMap: true,
    canViewFlightDetails: true,
    canUpdateFlightStatus: true,
    canSubmitIncidents: true,
    canAccessIncidentForm: true,
  },
  controller: {
    canViewDashboard: true,
    canViewMap: true,
    canViewFlightDetails: true,
    canUpdateFlightStatus: true,
    canSubmitIncidents: true,
    canAccessIncidentForm: true,
  },
  viewer: {
    canViewDashboard: true,
    canViewMap: true,
    canViewFlightDetails: true,
    canUpdateFlightStatus: false,
    canSubmitIncidents: false,
    canAccessIncidentForm: false,
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleSubject = new BehaviorSubject<UserRole>('supervisor');

  readonly role$ = this.roleSubject.asObservable();

  getRole(): UserRole {
    return this.roleSubject.value;
  }

  setRole(role: UserRole): void {
    this.roleSubject.next(role);
  }

  permissions(): RolePermissions {
    return PERMISSIONS[this.getRole()];
  }
}
