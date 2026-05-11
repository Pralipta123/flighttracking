import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'flights' },
  {
    path: 'flights',
    loadChildren: () => import('./features/flights/flights.module').then((m) => m.FlightsModule),
  },
  { path: '**', redirectTo: 'flights' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
