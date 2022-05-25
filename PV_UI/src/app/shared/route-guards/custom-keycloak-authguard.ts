import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomKeycloakAuthGuard extends KeycloakAuthGuard {
  constructor(
    protected router: Router,
    protected keycloakAngular: KeycloakService
  ) {
    super(router, keycloakAngular);
  }

  isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!this.authenticated) {
        this.keycloakAngular.login();
        return reject(false);
      }

      let granted: boolean = false;
      const token = this.keycloakAngular.getKeycloakInstance().tokenParsed;
      const requiredRoles = route.data.roles;
      if (
        token.resource_access[environment.keycloak.clientId] &&
        token.resource_access[environment.keycloak.clientId].roles
      ) {
        if (!requiredRoles || requiredRoles.length === 0) {
          granted = true;
        } else {
          for (const requiredRole of requiredRoles) {
            if (this.roles.indexOf(requiredRole) > -1) {
              granted = true;
              break;
            }
          }
        }
      } else {
        granted = false;
      }
      if (granted === false) {
        this.router.navigate(['/invalidRoles']);
      }
      resolve(granted);
    });
  }
}
