import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleBuilderRoutingModule } from './schedule-builder-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../product-schedule/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './components/main/main.component';
import { ScheduleListComponent } from './components/schedule-list/schedule-list.component';
import { DetailsComponent } from './components/details/details.component';
import { PortFilterComponent } from './components/port-filter/port-filter.component';
import { ExportToPdfComponent } from './components/export-to-pdf/export-to-pdf.component';
import { PdfTableComponent } from './components/export-to-pdf/pdf-table/pdf-table.component';
import { PdfHeaderComponent } from './components/export-to-pdf/pdf-header/pdf-header.component';
import { TranshippmentFiltersComponent } from './components/transhippment-filters/transhippment-filters.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MainComponent,
    ScheduleListComponent,
    DetailsComponent,
    PortFilterComponent,

    ExportToPdfComponent,
    PdfTableComponent,
    PdfHeaderComponent,
    TranshippmentFiltersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    ScheduleBuilderRoutingModule
  ]
})
export class ScheduleBuilderModule {}
