import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, Subscription } from 'rxjs';

@Component({
  selector: 'app-incident-report',
  templateUrl: './incident-report.component.html',
  styleUrls: ['./incident-report.component.scss'],
})
export class IncidentReportComponent implements OnInit, OnDestroy {
  readonly incidentTypes = [
    'Communication Failure',
    'Medical',
    'Security',
    'Maintenance',
    'Other',
  ];
  readonly severities = ['LOW', 'MEDIUM', 'HIGH'] as const;
  readonly teams = ['SOC', 'ATC', 'Maintenance', 'Cabin', 'Dispatch'];

  form: FormGroup = this.fb.group({
    flightId: ['', Validators.required],
    incidentType: ['', Validators.required],
    severity: ['MEDIUM', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    timestamp: [new Date(), Validators.required],
    assignedTeam: [''],
    frequency: [''],
    backupChannel: [''],
  });

  showCommFields = false;
  private sub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.applyDynamicValidators();
    this.showCommFields = this.form.get('incidentType')?.value === 'Communication Failure';
    this.sub = merge(
      this.form.get('severity')!.valueChanges,
      this.form.get('incidentType')!.valueChanges
    ).subscribe(() => {
      this.applyDynamicValidators();
      this.showCommFields = this.form.get('incidentType')?.value === 'Communication Failure';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.applyDynamicValidators();
    if (this.form.invalid) {
      this.snackBar.open('Please fix validation errors.', 'OK', { duration: 3500 });
      return;
    }
    this.snackBar.open('Incident recorded (simulated).', 'OK', { duration: 4000 });
    this.form.reset({
      flightId: '',
      incidentType: '',
      severity: 'MEDIUM',
      description: '',
      timestamp: new Date(),
      assignedTeam: '',
      frequency: '',
      backupChannel: '',
    });
    this.applyDynamicValidators();
  }

  private applyDynamicValidators(): void {
    const teamCtrl = this.form.get('assignedTeam')!;
    const freqCtrl = this.form.get('frequency')!;
    const backupCtrl = this.form.get('backupChannel')!;
    const severity = this.form.get('severity')?.value;
    const type = this.form.get('incidentType')?.value;

    teamCtrl.clearValidators();
    freqCtrl.clearValidators();
    backupCtrl.clearValidators();

    if (severity === 'HIGH') {
      teamCtrl.setValidators([Validators.required]);
    }

    if (type === 'Communication Failure') {
      freqCtrl.setValidators([Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]);
      backupCtrl.setValidators([Validators.required, Validators.minLength(3)]);
    }

    teamCtrl.updateValueAndValidity({ emitEvent: false });
    freqCtrl.updateValueAndValidity({ emitEvent: false });
    backupCtrl.updateValueAndValidity({ emitEvent: false });
  }
}
