import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../product-schedule/material/material.module';
import { CapacityDashboardRoutingModule } from './capacity-dashboard-routing.module';
import { SearchCountryComponent } from './components/search-country/search-country/search-country.component';
import { ExpandedViewComponent } from './components/expanded-view/expanded-view.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MainComponent,
    SearchCountryComponent,
    ExpandedViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CapacityDashboardRoutingModule
  ]
})
export class CapacityDashboardModule {}
