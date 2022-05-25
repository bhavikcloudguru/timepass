import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../product-schedule/material/material.module';
import { CapacityOverviewRoutingModule } from './capacity-overview-routing.module';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CapacityOverviewRoutingModule
  ]
})
export class CapacityOverviewModule {}
