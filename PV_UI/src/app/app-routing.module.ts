import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
//import { OktaCallbackComponent, OktaAuthGuard } from '@okta/okta-angular';
//import { ProtectedComponent } from './auth/protected/protected.component';
import { UserComponent } from './shared/components/user/user.component';
import { InvalidRolesComponent } from './shared/components/invalid-roles/invalid-roles.component';
import { SharedModule } from './shared/shared.module';
import { CustomKeycloakAuthGuard } from './shared/route-guards/custom-keycloak-authguard';
/*export function onAuthRequired({ oktaAuth, router }) {
  router.navigate(['/login']);
}*/

const routes: Routes = [
  {
    path: '',
    redirectTo: '/product-schedule',
    pathMatch: 'full'
  },
  //  { path: 'login', component: LoginComponent },

  {
    path: 'product-schedule',
    loadChildren:
      './product-schedule/product-schedule.module#ProductScheduleModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'browse-services',
    loadChildren:
      './browse-services/browse-services.module#BrowseServicesModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'customs-clearance',
    loadChildren:
      './data-repository/data-repository.module#DataRepositoryModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'schedule-builder',
    loadChildren:
      './schedule-builder/schedule-builder.module#ScheduleBuilderModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'capacity-overview',
    loadChildren:
      './capacity-overview/capacity-overview.module#CapacityOverviewModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'intermodal',
    loadChildren: './intermodal/intermodal.module#IntermodalModule',
    canActivate: [CustomKeycloakAuthGuard]
  },
  {
    path: 'super-admin',
    loadChildren: './super-admin/super-admin.module#SuperAdminModule',
    canActivate: [CustomKeycloakAuthGuard],
    data: { roles: ['super-admin'] }
  },
  // { path: 'implicit/callback', component: OktaCallbackComponent },
  /* {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [OktaAuthGuard],
    data: { onAuthRequired }
  },*/
  {
    path: 'invalidRoles',
    component: InvalidRolesComponent
  },
  {
    path: 'user',
    pathMatch: 'full',
    component: UserComponent,
    canActivate: [CustomKeycloakAuthGuard]
  }
];
/**
 * this is the main routing module of the application.
 * Here <router-outlet> is present in the app.component itself.
 * There is a need to display the dynamic content of the CONTENT of the side navigation bar.
 * For e.g Side Nav bar  have options like product search, product schedule search.
 * Their contents needs to be displayed dynamically on selection.
 * To achieve this, <ng-content> has been used. ( as we already have <router-outlet> to load the component
 * with SideNav --> LeftNavComponent)
 * LeftNavComponent is the component which has SideNavigation
 * bar and placeholder for the dynamic content. All the dynamic content components like
 * ProductViewerDashboardComponet, DashbaordComponent(product schedule module) have been wrapped with
 * <app-left-nav> tag. The contents of the <app-left-nav></<app-left-nav> are then replaced in the
 * <ng-content> of the LeftNavComponent component.
 * Anybody coding, any further dynamic components for the sidenav have to wrap the content of their
 * dynamic component within <app-left-nav></app-left-nav>
 *
 * @TODO - We can use secondary routing (named router-outlets) to reduce this complexity.
 * The URL will change though change and be somewhat like this
 * http://localhost:4200/#/viewer/(sidenav:dashboard)
 */
@NgModule({
  imports: [SharedModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
