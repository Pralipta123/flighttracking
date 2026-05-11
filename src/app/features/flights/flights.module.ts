import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from '../../shared/shared-material.module';
import { FlightsRoutingModule } from './flights-routing.module';
import { FlightsShellComponent } from './flights-shell/flights-shell.component';
import { FlightDashboardComponent } from './flight-dashboard/flight-dashboard.component';
import { FlightMapComponent } from './flight-map/flight-map.component';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';
import { IncidentReportComponent } from './incident-report/incident-report.component';

@NgModule({
  declarations: [
    FlightsShellComponent,
    FlightDashboardComponent,
    FlightMapComponent,
    FlightDetailComponent,
    IncidentReportComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedMaterialModule, FlightsRoutingModule],
})
export class FlightsModule {}
