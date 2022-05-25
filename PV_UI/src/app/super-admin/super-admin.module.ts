import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../product-schedule/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeliveryListComponent } from './components/delivery-list/delivery-list.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { MainComponent } from './components/main/main.component';
import { UserCountryComponent } from './components/user-country/user-country.component';
import { AddNewDlComponent } from './components/add-new-dl/add-new-dl.component';

@NgModule({
  declarations: [
    DeliveryListComponent,
    MainComponent,
    UserCountryComponent,
    AddNewDlComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SuperAdminRoutingModule
  ]
})
export class SuperAdminModule {}
