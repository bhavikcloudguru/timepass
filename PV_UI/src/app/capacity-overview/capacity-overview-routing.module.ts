import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'capacity',
        pathMatch: 'full'
      },
      {
        path: 'capacity',
        loadChildren:
          '../capacity-dashboard/capacity-dashboard.module#CapacityDashboardModule'
      },
      {
        path: 'requests',
        loadChildren:
          '../notification-inbox/notification-inbox.module#NotificationInboxModule'
      },
      {
        path: 'settings',
        loadChildren:
         '../capacity-settings/capacity-settings.module#CapacitySettingsModule',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CapacityOverviewRoutingModule {}
