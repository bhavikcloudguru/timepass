import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductViewerDashboardComponent } from './product-viewer-dashboard/product-viewer-dashboard.component';


const routes: Routes = [
  {
    path: '',
    component: ProductViewerDashboardComponent,
  },
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductViewerRoutingModule { }
