import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from '../components/main/main.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { FullViewFreeTimeCutOffTimeComponent } from '../components/full-view-free-time-cut-off-time/full-view-free-time-cut-off-time.component';
import { DeadlinesComponent } from 'src/app/data-repository/components/deadlines/deadlines.component';
import { PricingSurchargesComponent } from 'src/app/data-repository/components/pricing-surcharges/pricing-surcharges.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        pathMatch: 'full'
      },
      {
        path: 'full-view',
        component: FullViewFreeTimeCutOffTimeComponent,
        pathMatch: 'full'
      },
      {
        path: 'deadlines',
        component: DeadlinesComponent,
        pathMatch: 'full'
      },
      {
        path: 'surcharges',
        component: PricingSurchargesComponent,
        pathMatch: 'full'
      }
    ]
  }
];
@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataRepositoryRoutingModule {}
