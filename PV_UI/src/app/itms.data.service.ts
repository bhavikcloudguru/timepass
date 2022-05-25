import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
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
export class ITMSDataService {
  private muleprefix = '/swire/mulesoft/get';
  private muleprefixPost = '/swire/mulesoft/post';

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) {}

  getITMSData(params: any) {
    // let url = '/itms/countryListing/details';
    let url = '/swire/experience/api/v1/country-listing/details';
    if (params) {
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
    //  const url = '/customs/deadline/country';
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

  saveITMSData(params) {
    // const url = '/itms/countryListing/save';
    const url = '/swire/experience/api/v1/country-listing/details';
    return this.httpClient.post(this.muleprefixPost + url, params).pipe(
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('saveDeadlines', error);
        return of(error);
      })
    );
  }
}
