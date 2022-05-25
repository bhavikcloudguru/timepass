import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './config/app-config';
import { map, catchError, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StorageService } from './shared/storage/storage.service';
import { AppConstants } from './shared/app-constants/app-constants.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // url = 'http://localhost:9097';
  menuURL = AppSettings.API_ENDPOINT;

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) { }
  setDataOnLocal(keyName: string, data: any) {
    localStorage.setItem(keyName, JSON.stringify(data));
  }

  getDataFromLocal(keyName: string) {
    return JSON.parse(localStorage.getItem(keyName));
  }

  clearDataFromLocal(keyName: string) {
    localStorage.removeItem(keyName);
  }

  removeAllLocalData() {
    localStorage.clear();
  }
  getOriginDestList() {
    try {
      return this.httpClient.get('/swire/shippingFormService/loadPortDetails');
    } catch (error) {
      console.log(error);
    }
  }

  getProductList(searchData) {
    try {
      return this.httpClient.post(
        '/swire/shippingFormService/search',
        searchData,
        httpOptions
      );
    } catch (error) {
      console.log(error);
    }
  }
  getPortListForScheduleSearch() {
    const allPorts = this.storageService.getData(AppConstants.ALL_PORTS);
    if (allPorts && allPorts.length) {
      return of(allPorts);
    }
    // swire/schedule/allPorts
    return this.httpClient.get('/swire/schedule/allports').pipe(
      // Response process as per need
      map(response => {
        this.storageService.setData(AppConstants.ALL_PORTS, response);
        console.log('getPortListForScheduleSearch-success', response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getPortListForScheduleSearch-error', error);
        return of(error);
      })
    );
  }
  getProductSchedule(params: any) {
    // swire/schedule/allPorts
    return this.httpClient
      .post('/swire/schedule/search', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('getProductSchedule-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('getProductSchedule-error', error);
          return of(error);
        })
      );
  }
  getServiceDetailsByServiceCode(serviceName: string) {
    return this.httpClient
      .get('/swire/browse/servicename/' + serviceName, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('getServiceDetailsByServiceCode-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('getServiceDetailsByServiceCode-error', error);
          return of(error);
        })
      );
  }
  getBlobData(pdfUrl) {
    return this.httpClient
      .get(pdfUrl, { responseType: 'blob', withCredentials: false })
      .pipe(
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('getBlobData-error', error);
          return of(error);
        })
      );
  }
  getAgencyDetails(params) {
    return this.httpClient
      .post('/swire/office/search', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('getAgencyDetails-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('getAgencyDetails-error', error);
          return of(error);
        })
      );
  }
  postBlobData(params) {
    return this.httpClient
      .post('/swire/service/pdffiles/emailNDownloadService', params)
      .pipe(
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('postBlobData-error', error);
          return of(error);
        })
      );
  }
  getFreeTimeCutOffTimeOld(params) {
    /* private String fromdate;
    private String todate;
    private String originPortCode;
    private String vesselCode;
    private String voyageNumber;*/
    const param1 = {
      originPortCode: params.portName,
      vesselCode: params.vesselCode,
      voyageNumber: params.voyageNumber,
      todate: params.todate,
      fromdate: params.fromdate
    };
    return this.httpClient
      .post('/swire/free-cutoff/fetch/origin-api', param1)
      .pipe(
        concatMap((r: any) => {
          return this.httpClient.post('/swire/free-cutoff/calculate', {
            ...params,
            arrivalDate: r.arrivalDate
          });
        }),
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('getFreeTimeCutOffTime', error);
          return of(error);
        })
      );
  }
  getFreeTimeCutOffTime(params) {
    return this.httpClient
      .post('swire/free-cutoff/calculate-origin-api', params)
      .pipe(
        // Response process as per need
        map((response: any) => {
          if (response && response.freeCutoffTimeInfo) {
            console.log(
              ' response.freeCutoffTimeInfo',
              response.freeCutoffTimeInfo
            );
            return response.freeCutoffTimeInfo;
          } else {
            return [];
          }
        }),
        // handle exception as per need
        catchError(error => {
          console.log('getFreeTimeCutOffTime', error);
          return of(error);
        })
      );
  }
  getFullViewFreeTimeCutOffTime() {
    return this.httpClient.get('/swire/full-view/getAllVesselSchedules').pipe(
      // return this.httpClient.get('/full_time_view_response.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getFullViewFreeTimeCutOffTime', error);
        return of(error);
      })
    );
  }
  getGroupDetails(groupName) {
    return this.httpClient.post('/swire/group/roles', { groupName }).pipe(
      // return this.httpClient.get('/assets/group.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getGroupDetails', error);
        return of(error);
      })
    );
  }

  getCargoRestrictionDetails(ports) {
    return this.httpClient.post('/swire/port/restrictions', ports).pipe(
      // return this.httpClient.get('/assets/group.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getCargoRestrictionDetails', error);
        return of(error);
      })
    );
  }

  getCargoDetails() {
    return this.httpClient.get('/swire/cargos/cargo').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getcargodetails', error);
        return of(error);
      })
    );
  }

  postEmailServiceData(params) {
    return this.httpClient.post('/swire/capacitymanager/email', params).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('postBlobData-error', error);
        return of({ ...error, isError: true });
      })
    );
  }
  getGroups() {
    return this.httpClient.get('/swire/user/groups').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getGroups', error);
        return of(error);
      })
    );
  }
  getUserLocations() {
    return this.httpClient.get('/assets/userLocations.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getUserLocations', error);
        return of(error);
      })
    );
  }
  getDesignations() {
    return this.httpClient.get('/assets/designation.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getDesignations', error);
        return of(error);
      })
    );
  }
  getUser(emailId: string) {
    return this.httpClient.get('/swire/user/permission/' + emailId).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getDesignations', error);
        return of(error);
      })
    );
  }
  registerUser(params: any) {
    // swire/schedule/allPorts
    return this.httpClient
      .post('/swire/user/permission', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('registerUser-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('registerUser-error', error);
          return of(error);
        })
      );
  }

  sendFeedbackEmail(params: any) {
    return this.httpClient
      .post('/swire/feedback/email', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          console.log('registerUser-success', response);
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          console.log('registerUser-error', error);
          return of(error);
        })
      );
  }
  getPortPairsForScheduleBuilder(params: any, vss: boolean) {
    let url = '/swire/schedule/fullSchedulePortPairs';
    if (vss) {
      url = url + 'VSS';
    }
    return this.httpClient.post(url, params, httpOptions).pipe(
      // Response process as per need
      map(response => {
        console.log('getPortPairsForScheduleBuilder-success', response);
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        console.log('getPortPairsForScheduleBuilder-error', error);
        return of(error);
      })
    );
  }
  /** Get list of portCode and portName */
  public getPortCodeToName(
    portCodes: string[]
  ): { portCode: string; portName: string }[] {
    const allPorts = this.storageService.getData(AppConstants.ALL_PORTS);
    if (allPorts && allPorts.length) {
      return allPorts.filter(a => portCodes.indexOf(a.portCode) > -1);
    }
    return [];
  }
  public getCountryNameFromPortCode(portCode: any): String {
    const allPorts = this.storageService.getData(AppConstants.ALL_PORTS);
    if (allPorts && allPorts.length) {
      let port = allPorts.filter(a => portCode === a.portCode);
      if (port.length > 0) {
        return port[0].countryName;
      } else {
        return '';
      }
    }
    return '';
  }

  postFavouriteData(params: any) {
    return this.httpClient
      .post('swire/user/favorite', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getFavouriteData(params: any) {
    return this.httpClient
      .post('swire/user/favorite/findAll', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getFavouriteMinData(params: any) {
    return this.httpClient
      .post('swire/user/favorite/findAllmin', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getFavouriteByPorts(params: any) {
    return this.httpClient
      .post('/swire/user/favorite/findAllmin/ports', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getNotificationCount(emailId: string) {
    return this.httpClient.get('swire/user/notificationCount/' + emailId).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getnotifications', error);
        return of(error);
      })
    );
  }
  /*
  getNotifications(emailId: string) {
    return this.httpClient.get('swire/user/notificationList/' + emailId).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getnotifications', error);
        return of(error);
      })
    );
  }*/
  getBookingDetailsForEmailId(emailId: string) {
    return this.httpClient.get('swire/bookings/details/' + emailId).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getBookingDetailsForEmailId', error);
        return of(error);
      })
    );
  }

  sendRequestStatus(params: any) {
    return this.httpClient
      .post('/swire/user/notifications/action', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of({ ...error, isError: true });
        })
      );
  }

  sendBulkRequestStatus(params: any) {
    return this.httpClient
      .post('/swire/user/notifications/action/bulk', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of({ ...error, isError: true });
        })
      );
  }

  getBookingDetails(params: any) {
    return this.httpClient
      .post('/swire/bookings/details', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  /*cancelRequest(bookingId: string) {
    return this.httpClient.get('swire/bookings/cancel/' + bookingId).pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('getnotifications', error);
        return of(error);
      })
    );
  }*/

  markAsRead(bookingId: string, email: string, isRead: boolean) {
    return this.httpClient
      .get(
        'swire/bookings/markAsRead/' + email + '/' + bookingId + '/' + isRead
      )
      .pipe(
        // Response process as per need
        map(response => response),
        // handle exception as per need
        catchError(error => {
          console.log('getnotifications', error);
          return of(error);
        })
      );
  }

  getCarbonEmissionData() {
    return this.httpClient.get('/assets/co2Emission.json').pipe(
      // Response process as per need
      map(response => response),
      // handle exception as per need
      catchError(error => {
        console.log('get carbon emission data', error);
        return of(error);
      })
    );
  }

  getNextPodDetails(params: any) {
    return this.httpClient
      .post('swire/port/destination', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }
  getOperationalCountries(originCountryCode: any) {
    return this.httpClient
      .get(
        'swire/schedule/operationalCountries/' + originCountryCode,
        httpOptions
      )
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getCo2Credits() {
    return this.httpClient.get('swire/user/co2credit', httpOptions).pipe(
      // Response process as per need
      map(response => {
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        return of(error);
      })
    );
  }

  postCo2Credits(params: any) {
    return this.httpClient
      .post('swire/user/co2credit', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }
  downloadPdf(selectedRecords, downloadFileName) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        templateId: 'SwireShipping',
        downloadFileName
      }),
      responseType: 'blob'
    };
    console.log('downloadPdf', selectedRecords, httpOptions);
    return this.httpClient.post(
      'https://msapigw-dev.swiredigital-s3-staging.com:8083/pdf/generate',
      selectedRecords,
      {
        responseType: 'blob',
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          templateId: 'SwireShipping'
        })
      }
    );
  }

  getAllUser() {
    try {
      return this.httpClient.get('/swire/user/getalluser');
    } catch (error) {
      console.log(error);
    }
  }




  getInitialDropDownDetails() {
    return this.httpClient.get('/swire/capacitymanager/fetch/intial/capacity/dropdown', httpOptions).pipe(
      // Response process as per need
      map(response => {
        return response;
      }),
      // handle exception as per need
      catchError(error => {
        return of(error);
      })
    );
  }

  getDropDownSelectionDetails(params) {
    return this.httpClient
      .post('/swire/capacitymanager/fetch/filtered/capacity/dropdown', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }


  getVesselVoyageDetails(params) {
    return this.httpClient
      .post('/swire/capacitymanager/capacity/search', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  getVesselPortList(params) {
    return this.httpClient
      .post('/swire/capacitymanager/capacity/filter/search', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );
  }

  saveThresholdData(params) {
    return this.httpClient
      .post('/swire/capacitymanager/capacity/save/threshold', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );

  }
  saveThresholdDefaultData(params) {
    return this.httpClient
      .post('/swire/capacitymanager/capacity/default/threshold', params, httpOptions)
      .pipe(
        // Response process as per need
        map(response => {
          return response;
        }),
        // handle exception as per need
        catchError(error => {
          return of(error);
        })
      );

  }
}
