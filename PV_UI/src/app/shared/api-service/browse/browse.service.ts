import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { Utils } from 'src/app/common/utilities/Utils';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class BrowseService {
  constructor(private http: HttpClient) {}

  //not using now.
  /**
   * Get Data from API service using service code.
   * @param  string  serviceCode : ServiceCode
   */
  /*public getServiceList(serviceCode: string): Observable<any> {
    return this.http.get<any>(`/swire/browse/servicename/` + serviceCode).pipe(
      map(response => {
        const data = this.processData(response);
        return data;
      }),
      catchError(err => {
        return throwError(err);
      })
    );
  }*/

  /**
   * POST TRAFFIC Data to DB
   * @param  any  service data :
   */

  public postServiceList(data: any): Observable<any> {
    let emailId = '';
    const userInfo = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userInfo && userInfo.email) {
      emailId = userInfo.email;
    }
    return this.http
      .post<any>(
        `swire/capacitytraffic/capacitylight/` + emailId,
        data,
        httpOptions
      )
      .pipe(
        map(response => {
          return response;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  /**
   * process data for VIEW in table
   * @param  vessels  vessels data :
   * return vessels
   */

  public getVessels(vessels): any {
    for (const vessel of vessels) {
      for (const data of vessel.value) {
        data.duration =
          formatDate(data.arrivalDate, 'dd LLL', 'en-US') +
          ' - ' +
          formatDate(data.departureDate, 'dd LLL', 'en-US');
        data.trafficStatus = data.trafficStatus ? data.trafficStatus : 'gray';
        data.show = false;
        if (data.notes) {
          vessel.notes = true;
        }
      }
    }
    return vessels;
  }

  /**
   * process data for VIEW in table
   * @param  service  service data :
   * return vessels and ports
   */

  public processData(service: any, portList: any): any {
    let ports: any[];
    let vessels: any[];
    ports = portList;
    vessels = service
      .filter(item => {
        if (item.vesselCode && item.voyageNumber) {
          return true;
        }
      })
      .map(data => {
        return { ...data, label: data.vesselName + '-' + data.voyageNumber };
      });
    for (const port of ports) {
      for (const data of vessels) {
        if (port.portCode === data.portCode && !port[data.label]) {
          port[data.label] = {
            portCode: data.portCode,
            departureDate: data.departureDate,
            vesselCode: data.vesselCode,
            vesselName: data.vesselName,
            voyageNumber: data.voyageNumber,
            arrivalDate: data.arrivalDate,
            serviceCode: data.serviceCode,
            duration:
              formatDate(data.arrivalDate, 'dd LLL', 'en-US') +
              ' - ' +
              formatDate(data.departureDate, 'dd LLL', 'en-US'),
            trafficStatus: data.trafficStatus ? data.trafficStatus : 'gray',
            notes: data.notes,
            show: false
          };
        }
      }
    }
    // console.log(ports);
    const uniqVessels = vessels.filter(
      (v, i, a) => a.findIndex(t => t.label === v.label) === i
    );
    return {
      vessels: uniqVessels,
      ports
    };
  }

  public unique(array, propertyName) {
    return array
      .filter((e, i) => {
        if (e[propertyName]) {
          return (
            array.findIndex(a => a[propertyName] === e[propertyName]) === i
          );
        } else {
          return false;
        }
      })
      .map(item => {
        if (item.portCode && item.portName) {
          return {
            portCode: item.portCode,
            portName: item.portName
          };
        } else {
          return {};
        }
      });
  }

  public sortArrays(ports, order, key) {
    const keyvalues = order.map(a => a.portCode);
    const keys = [...new Set(keyvalues)];
    const sortedArrays = [];
    keys.forEach((element, i) => {
      const fIndex = ports.findIndex(el => el.portCode === keys[i]);
      if (fIndex >= 0) {
        sortedArrays.push(ports[fIndex]);
      }
    });

    ports.forEach(element => {
      const indx = sortedArrays.findIndex(
        el => el.portCode === element.portCode
      );
      if (indx < 0) {
        sortedArrays.push(element);
      }
    });
    return sortedArrays;
  }
}
