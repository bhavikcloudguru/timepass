import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { CapacitySettingsRoutingModule } from './capacity-settings-routing.module';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { SearchComponent } from './components/search/search.component';
import { ResultComponent } from './components/result/result.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../product-schedule/material/material.module';
import { ExpandViewComponent } from './components/expand-view/expand-view.component';



@NgModule({
  declarations: [
    MainComponent,
    DashboardComponent,
    SearchComponent,
    ResultComponent,
    ExpandViewComponent
  ],
  imports: [
    CommonModule,
    CapacitySettingsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ]
})
export class CapacitySettingsModule { }
