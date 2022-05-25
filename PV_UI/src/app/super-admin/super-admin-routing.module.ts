import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeliveryListComponent } from './components/delivery-list/delivery-list.component';
import { MainComponent } from './components/main/main.component';
import { UserCountryComponent } from './components/user-country/user-country.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'deliverylist'
      },
      {
        path: 'deliverylist',
        component: DeliveryListComponent
      },
      {
        path: 'usercountries',
        component: UserCountryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule {}
