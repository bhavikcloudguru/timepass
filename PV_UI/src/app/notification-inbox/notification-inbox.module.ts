import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../product-schedule/material/material.module';
import { NotificationInboxRoutingModule } from './notification-inbox-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainComponent } from './components/main/main.component';
import { DetailsComponent } from './components/details/details.component';
import { NotificationPanelHeaderComponent } from './components/notification-panel-header/notification-panel-header.component';
import { NotificationPanelBodyComponent } from './components/notification-panel-body/notification-panel-body.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MainComponent,
    DetailsComponent,
    NotificationPanelHeaderComponent,
    NotificationPanelBodyComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NotificationInboxRoutingModule
  ]
})
export class NotificationInboxModule {}
