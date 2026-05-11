export type UserRole = 'supervisor' | 'controller' | 'viewer';

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewMap: boolean;
  canViewFlightDetails: boolean;
  canUpdateFlightStatus: boolean;
  canSubmitIncidents: boolean;
  canAccessIncidentForm: boolean;
}
