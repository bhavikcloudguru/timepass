import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { DataRepositoryRoutingModule } from './data-repository-routing/data-repository-routing.module';
import { FullViewFreeTimeCutOffTimeComponent } from './components/full-view-free-time-cut-off-time/full-view-free-time-cut-off-time.component';
import { MaterialModule } from '../product-schedule/material/material.module';
import { DeadlinesComponent } from '../data-repository/components/deadlines/deadlines.component';
import { PricingSurchargesComponent } from '../data-repository/components/pricing-surcharges/pricing-surcharges.component';

@NgModule({
  declarations: [
    MainComponent,
    DashboardComponent,
    FullViewFreeTimeCutOffTimeComponent,
    DeadlinesComponent,
    PricingSurchargesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DataRepositoryRoutingModule,
    MaterialModule
  ]
})
export class DataRepositoryModule {}
