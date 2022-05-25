import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductViewerRoutingModule } from './product-viewer-routing.module';
import { ProductViewerDashboardComponent } from './product-viewer-dashboard/product-viewer-dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductViewerDashboardService } from './product-viewer-dashboard/product-viewer-dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  declarations: [ProductViewerDashboardComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    ProductViewerRoutingModule,
    SharedModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatGridListModule
    // MatSidenavModule,
    // MatListModule
  ],
  providers: [ProductViewerDashboardService]
})
export class ProductViewerModule {}
