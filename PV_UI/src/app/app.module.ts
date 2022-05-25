import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductViewerComponent } from './product-viewer/product-viewer.component';
import { ProductViewerModule } from './product-viewer/product-viewer.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from './shared/shared.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from './auth/login/login.component';
//import { OktaAuthModule } from '@okta/okta-angular';
import { environment } from '../environments/environment';
import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import { ProductScheduleModule } from './product-schedule/product-schedule.module';
import { BrowseServicesModule } from './browse-services/browse-services.module';
import { DataRepositoryModule } from './data-repository/data-repository.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './shared/api-service/interceptor/httpconfig.interceptor';
import { ScheduleBuilderModule } from './schedule-builder/schedule-builder.module';
import { CapacityDashboardModule } from './capacity-dashboard/capacity-dashboard.module';
import { PreLoaderComponent } from './shared/components/pre-loader/pre-loader.component';
import { NotificationInboxModule } from './notification-inbox/notification-inbox.module';
import { CapacityOverviewModule } from './capacity-overview/capacity-overview.module';
import { IntermodalModule } from './intermodal/intermodal.module';
import { UserComponent } from './shared/components/user/user.component';
import { initializer } from './initializer';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { CapacitySettingsModule } from './capacity-settings/capacity-settings.module';

// import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    ProductViewerComponent,
    LoginComponent,
    PreLoaderComponent,
    UserComponent
  ],
  imports: [
    // OktaAuthModule.initAuth(environment.oktaConfig),
    // HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ProductViewerModule,
    MatSidenavModule,
    MatListModule,
    BrowserAnimationsModule,
    SharedModule.forRoot(),
    MatToolbarModule,
    LayoutModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ProductScheduleModule,
    BrowseServicesModule,
    DataRepositoryModule,
    ScheduleBuilderModule,
    CapacityDashboardModule,
    CapacityOverviewModule,
    NotificationInboxModule,
    IntermodalModule,
    KeycloakAngularModule,
    SuperAdminModule,
    CapacitySettingsModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [KeycloakService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
