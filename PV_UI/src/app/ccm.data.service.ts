import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StorageService } from './shared/storage/storage.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class CCMDataService {
  private muleprefix = '/swire/mulesoft/get';
  private muleprefixPost = '/swire/mulesoft/post';
  private muleprefixdelete = '/swire/mulesoft/delete';
  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) {}

  getDeadlinesData(params: any) {
    // let url = '/customs/deadline/find';
    let url = '/swire/experience/api/v1/customs-deadline/find';
    if (params) {
      //   url = '/' + params;
      url = '/by-code/' + params;
    }
    return this.httpClient.get(this.muleprefix + url, httpOptions).pipe(
      // Response process as per need
      map(response => {
        console.log('getDeadlinesData-success', response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getDeadlinesData-error', error);
        return of(error);
      })
    );
  }
  getCountries() {
    // const url = '/customs/deadline/country';
    const url = '/swire/experience/api/v1/customs-deadline/country';
    const countries = this.storageService.getData(url);
    if (countries && countries.length) {
      return of(countries);
    }
    return this.httpClient.get(this.muleprefix + url, httpOptions).pipe(
      // Response process as per need
      map(response => {
        console.log('getCountries-success', response);
        this.storageService.setData(url, response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getCountries-error', error);
        return of(error);
      })
    );
  }
  getEvents() {
    // const url = '/customs/deadline/event';
    const url = '/swire/experience/api/v1/customs-deadline/event';
    const events = this.storageService.getData(url);
    if (events) {
      return of(events);
    }
    return this.httpClient.get(this.muleprefix + url, httpOptions).pipe(
      // Response process as per need
      map(response => {
        console.log('getEvents-success', response);
        this.storageService.setData(url, response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getEvents-error', error);
        return of(error);
      })
    );
  }
  getUnitOfMeasurements() {
    // const url = '/customs/deadline/uom';
    const url = '/swire/experience/api/v1/customs-deadline/uom';
    const uom = this.storageService.getData(url);
    if (uom && uom.length) {
      return of(uom);
    }
    return this.httpClient.get(this.muleprefix + url, httpOptions).pipe(
      // Response process as per need
      map(response => {
        console.log('getUnitOfMeasurements-success', response);
        this.storageService.setData(url, response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getUnitOfMeasurements-error', error);
        return of(error);
      })
    );
  }
  saveDeadlines(params) {
    // return this.httpClient.post('/customs/deadline/save', params).pipe(
    return this.httpClient
      .post(
        this.muleprefixPost + '/swire/experience/api/v1/customs-deadline/find',
        params
      )
      .pipe(
        // return this.httpClient.get('/assets/group.json').pipe(
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('saveDeadlines', error);
          return of(error);
        })
      );
  }
  getLastUpdatedForDeadlines() {
    //  return this.httpClient.get('/customs/deadline/lastupdate').pipe(
    return this.httpClient
      .get(
        this.muleprefix + '/swire/experience/api/v1/customs-deadline/lastUpdate'
      )
      .pipe(
        //return this.httpClient.get('/swire/user/deadline/lastupdate').pipe(
        // return this.httpClient.get('/assets/group.json').pipe(
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('getLastUpdatedForDeadlines', error);
          return of(error);
        })
      );
  }

  getPricingDetails() {
    //  const url ='/customs/pricing/product/all/new';
    const url = '/swire/experience/api/v1/product-pricing/products';
    return this.httpClient.get(this.muleprefix + url).pipe(
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('pricing', error);
        return of(error);
      })
    );
  }

  savePricingDetails(params) {
    //const url ='/customs/pricing/product/save/new';
    const url = '/swire/experience/api/v1/product-pricing/products';
    return this.httpClient.post(this.muleprefixPost + url, params).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('savePricingSurcharges', error);
        return of(error);
      })
    );
  }

  deleteSurcharge(params) {
    //  const url = '/customs/pricing/product/delete/';
    const url = '/swire/experience/api/v1/product-pricing/products/by-id/';

    return this.httpClient.delete(this.muleprefixdelete + url + params).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('delete surcharges', error);
        return of(error);
      })
    );
  }

  getSurcharges() {
    // const url = '/customs/pricing/surcharge/all';
    const url = '/swire/experience/api/v1/product-pricing/surcharge';
    return this.httpClient.get(this.muleprefix + url).pipe(
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('pricing', error);
        return of(error);
      })
    );
  }

  getCustomers() {
    //const url = '/customs/pricing/customer/all';
    const url = '/swire/experience/api/v1/product-pricing/customer';
    const customers = this.storageService.getData(url);
    if (customers && customers.length) {
      return of(customers);
    }

    return this.httpClient.get(this.muleprefix + url).pipe(
      map(response => {
        console.log('getCountries-success', response);
        this.storageService.setData(url, response);
        return response;
      }),
      catchError(error => {
        console.log('customers', error);
        return of(error);
      })
    );
  }
}
