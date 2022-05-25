import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseServicesRoutingModule } from './browse-services-routing/browse-services-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../product-schedule/material/material.module';
import { DetailsComponent } from './details/details.component';
import { MainComponent } from './main/main.component';
import { NotesPopupComponent } from './components/notes-popup/notes-popup.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DashboardComponent,
    DetailsComponent,
    MainComponent,
    NotesPopupComponent
  ],
  imports: [
    CommonModule,
    BrowseServicesRoutingModule,
    SharedModule,
    MaterialModule,
    FormsModule
  ]
})
export class BrowseServicesModule {}
