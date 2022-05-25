import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { Utils } from 'src/app/common/utilities/Utils';
import { environment } from 'src/environments/environment';

//import { NoAccessComponent } from '../components/no-access/no-access.component';

@Directive({
  selector: '[appAllowAccess]'
})
export class AllowAccessDirective implements AfterViewInit {
  // This will be the app name for which we need to check the permission.
  @Output() isReadOnly = new EventEmitter<boolean>();
  @Output() isAccessDenied = new EventEmitter<boolean>();
  private _appName = [];
  @Input() set appAllowAccess(a: string[]) {
    this._appName = a;
  }
  get appAllowAccess() {
    return this._appName;
  }
  constructor() {}
  ngAfterViewInit(): void {
    this.checkAccess();
  }

  private checkAccess() {
    /**
     * We need to check access.
     * We wait for currentlyLoggedInUserInfo. ( usually, this info will be present. For components
     * loaded on start up, this might take a second or 2 to load up.)
     * If this is no currentlyLoggedInUserInfo, We dont do anything.
     * If the user has currentlyLoggedInUserInfo , we iterate through the client roles info present
     * and then check for  permission .
     * We append the permission for the current feature to a string currentFeaturePermission.
     * ( this due to the fact that one user can have multiple groups and different groups can have
     * different permission. We will give the most liberal permission available to the user.)
     * After iterating through all features and permissions,
     * If currentFeaturePermission contains W, we do nothing.
     * If currentFeaturePermission contains only R and not W, we give readonly accees
     * If currentFeaturePermission contains neither R or W, we load access denied component.
     *
     */
    const loggedInInfo = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    console.log('loggedInInfo', loggedInInfo);
    this.renderNoAccess();
    if (!loggedInInfo || !loggedInInfo.resource_access) {
      this.renderNoAccess();
      setTimeout(() => {
        this.checkAccess();
      }, 200);
      return;
    }
    const currentFeaturePermission = [] as string[];
    let rolesAssignedToUser = [];
    // pm roles
    loggedInInfo.resource_access[environment.keycloak.clientId] &&
      loggedInInfo.resource_access[environment.keycloak.clientId].roles &&
      (rolesAssignedToUser = [
        ...loggedInInfo.resource_access[environment.keycloak.clientId].roles
      ]);
    // ccm roles
    loggedInInfo.resource_access[environment.keycloak.ccmId] &&
      loggedInInfo.resource_access[environment.keycloak.ccmId].roles &&
      (rolesAssignedToUser = [
        ...rolesAssignedToUser,
        ...loggedInInfo.resource_access[environment.keycloak.ccmId].roles
      ]);
    // itms roles
    loggedInInfo.resource_access[environment.keycloak.itmsId] &&
      loggedInInfo.resource_access[environment.keycloak.itmsId].roles &&
      (rolesAssignedToUser = [
        ...rolesAssignedToUser,
        ...loggedInInfo.resource_access[environment.keycloak.itmsId].roles
      ]);
    rolesAssignedToUser.forEach(clientRoles => {
      const permissions = clientRoles.split('.');
      if (this.appAllowAccess.indexOf(permissions[0]) === -1) {
        return;
      }
      const permission = permissions[1];
      if (permission === 'edit') {
        // do nothing
        // this.undorenderNoAccess();
        currentFeaturePermission.push('W');
      } else if (permission === 'view') {
        // if only readonly access
        currentFeaturePermission.push('R');
        // this.renderReadOnlyAccess();
      } else {
        // if no access
        // this.renderNoAccess();
      }
    });
    console.log('currentFeaturePermission', currentFeaturePermission);
    if (currentFeaturePermission.indexOf('W') > -1) {
      this.renderAccess();
      this.renderWriteAccess();
    } else if (currentFeaturePermission.indexOf('R') > -1) {
      this.renderAccess();
      this.renderReadOnlyAccess();
    } else {
      this.renderNoAccess();
    }
  }
  private renderReadOnlyAccess() {
    this.isReadOnly.emit(true);
  }
  private renderWriteAccess() {
    this.isReadOnly.emit(false);
  }
  private renderNoAccess() {
    /*const component = this.component;
    if (component) {
      component.element.nativeElement.style.display = 'none';
      component.clear();
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        NoAccessComponent
      );
      const componentRef = component.createComponent(componentFactory);
    }*/
    this.isAccessDenied.emit(true);
  }
  private renderAccess() {
    this.isAccessDenied.emit(false);
  }
}
