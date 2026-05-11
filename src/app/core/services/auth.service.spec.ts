import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should grant incident access to supervisor', () => {
    const svc = TestBed.inject(AuthService);
    svc.setRole('supervisor');
    expect(svc.permissions().canAccessIncidentForm).toBeTrue();
  });

  it('should deny incident access to viewer', () => {
    const svc = TestBed.inject(AuthService);
    svc.setRole('viewer');
    expect(svc.permissions().canAccessIncidentForm).toBeFalse();
    expect(svc.permissions().canUpdateFlightStatus).toBeFalse();
  });
});
