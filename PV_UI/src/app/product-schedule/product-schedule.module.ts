import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { ResultsComponent } from './components/results/results.component';
import { ProductScheduleRoutingModule } from './product-schedule-routing/product-schedule-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { MaterialModule } from './material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SliderComponent } from './components/slider/slider.component';

import { ExportToPdfComponent } from './export-to-pdf/export-to-pdf.component';
import { FreeTimeCutOffTimePopupComponent } from './components/free-time-cut-off-time-popup/free-time-cut-off-time-popup.component';
import { FreeTimeCutOffTimeComponent } from './components/free-time-cut-off-time-popup/free-time-cut-off-time/free-time-cut-off-time.component';
import { ResultsExpandedComponent } from './components/results-expanded/results-expanded.component';
import { CargoRestrictionCardComponent } from './components/cargo-restriction-card/cargo-restriction-card.component';
import { BookingAcceptanceComponent } from './components/booking-acceptance/booking-acceptance.component';
import { Co2EmissionComponent } from './components/co2-emission/co2-emission.component';

@NgModule({
  declarations: [
    SearchComponent,
    ResultsComponent,
    DashboardComponent,

    SliderComponent,
    ExportToPdfComponent,
    FreeTimeCutOffTimePopupComponent,
    FreeTimeCutOffTimeComponent,
    ResultsExpandedComponent,
    CargoRestrictionCardComponent,
    BookingAcceptanceComponent,
    Co2EmissionComponent
  ],
  imports: [
    CommonModule,
    ProductScheduleRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  entryComponents: [DashboardComponent, ExportToPdfComponent]
})
export class ProductScheduleModule {}
