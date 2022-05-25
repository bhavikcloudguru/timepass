import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../product-schedule/material/material.module';
import { IntermodalRoutingModule } from './intermodal-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductPricingComponent } from './components/product-pricing/product-pricing.component';

@NgModule({
  declarations: [DashboardComponent, ProductPricingComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    IntermodalRoutingModule
  ]
})
export class IntermodalModule {}
