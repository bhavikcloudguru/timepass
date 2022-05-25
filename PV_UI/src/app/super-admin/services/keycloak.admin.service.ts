import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class KeycloakAdminService {
  constructor(private httpClient: HttpClient) {}

  public getEmailDeliveryListFromKeycloak() {
    const attr = 'emailDeliveryLists';
    return this.getAttributeFromKeycloak(attr).pipe(
      map(r => r['emailDeliveryLists'])
    );
  }
  public getEmailDeliveryListCountriesFromKeycloak() {
    const attr = 'emailDeliveryListsCountries';
    return this.getAttributeFromKeycloak(attr).pipe(
      map(r => r['emailDeliveryListsCountries'])
    );
  }
  public getUserCountriesFromKeycloak() {
    const attr = 'usercountries';
    return this.getAttributeFromKeycloak(attr).pipe(
      map(r => r['usercountries'])
    );
  }
  public getUsersFromKeycloak() {
    return this.httpClient.get('/swire/keycloak/getUsersFromKeycloak').pipe(
      // Response process as per need
      map(response => {
        console.log('getUsersFromKeycloak-success', response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getUsersFromKeycloak-error', error);
        return of(error);
      })
    );
  }
  public getAttributeFromKeycloak(attribute: string) {
    return this.httpClient
      .get('/swire/keycloak/clients/getAttributes/' + attribute)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('getEmailDeliveryListFromKeycloak-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('getEmailDeliveryListFromKeycloak-error', error);
          return of(error);
        })
      );
  }
  public saveAttributesToKeycloak(attributes: any) {
    return this.httpClient
      .post('/swire/keycloak/clients/saveAttributes', attributes)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('saveAttributesToKeycloak-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('saveAttributesToKeycloak-error', error);
          return of(error);
        })
      );
  }
}
