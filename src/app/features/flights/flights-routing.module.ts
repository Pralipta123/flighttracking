import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FlightsShellComponent } from './flights-shell/flights-shell.component';
import { FlightDashboardComponent } from './flight-dashboard/flight-dashboard.component';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';
import { IncidentReportComponent } from './incident-report/incident-report.component';

const routes: Routes = [
  {
    path: '',
    component: FlightsShellComponent,
    children: [
      { path: '', component: FlightDashboardComponent, pathMatch: 'full' },
      { path: 'flight/:id', component: FlightDetailComponent },
      {
        path: 'incidents',
        component: IncidentReportComponent,
        canActivate: [RoleGuard],
        data: { roles: ['supervisor', 'controller'] },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightsRoutingModule {}
