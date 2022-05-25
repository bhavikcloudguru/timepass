/** This is a utility class which holds common purpose functions. */
export class Utils {
  // Stores the Info of currently logged In User.
  private static _currentlyLoggedInUserInfoKeyCloak: any;
  public static get currentlyLoggedInUserInfoKeyCloak() {
    return this._currentlyLoggedInUserInfoKeyCloak;
  }
  public static set currentlyLoggedInUserInfoKeyCloak(userInfo) {
    this._currentlyLoggedInUserInfoKeyCloak = userInfo;
  }
  /** Service Name to service code to zone mapping */
  private static readonly SERVICE_CODE_SERVICE_NAME_MAPPING = [
    {
      serviceName: 'ASIA PACIFIC AUSTRALIA ASIA SERVICE',
      serviceCode: 'APA',
      zone: '',
      filename: 'Service_Framework_NZAP_APA.pdf'
    },
    {
      serviceName: 'SOUTH EAST ASIA SERVICE',
      serviceCode: 'CHA',
      zone: '',
      filename: 'Service_Framework_SEA.pdf'
    },
    {
      serviceName: 'EAST SOUTH EAST ASIA SERVICE',
      serviceCode: 'ESEA',
      zone: '',
      filename: 'Service_Framework_ESEA.pdf'
    },
    {
      serviceName: 'EAST TIMOR SERVICE',
      serviceCode: 'ETS',
      zone: '',
      filename: 'Service_Framework_ETS.pdf'
    },
    {
      serviceName: 'GUAM SAIPAN EXPRESS', // 'Pacific North Asia',
      serviceCode: 'GSX',
      zone: '',
      filename: 'Service_Framework_MICRONESIA.pdf'
    },
    {
      serviceName: 'NORTH ASIA SERVICE',
      serviceCode: 'NATS',
      zone: '',
      filename: 'Service_Framework_NAT.pdf'
    },
    {
      serviceName: 'NORTH ASIA EXPRESS SERVICE',
      serviceCode: 'NAX',
      zone: '',
      filename: 'Service_Framework_NAX.pdf'
    },
    {
      serviceName: 'NEW GUINEA SHUTTLE', // 'New Zealand Eastern Pacific Islands',
      serviceCode: 'NGS',
      zone: '',
      filename: 'Service_Framework_SEA.pdf'
    },
    /*{
      serviceName: 'NETWORK OPS SERVICE',
      serviceCode: 'NOPS',
      zone: '',
      filename: ''
    },*/
    {
      serviceName: 'NEW ZEALAND / ASIA / PACIFIC',
      serviceCode: 'NZAP',
      zone: '',
      filename: 'Service_Framework_NZAP_APA.pdf'
    },
    {
      serviceName: 'NEW ZEALAND PACIFIC ISLAND SERVICE',
      serviceCode: 'NZPI',
      zone: '',
      filename: 'Service_Framework_NZP.pdf'
    },
    {
      serviceName: 'PACIFICA',
      serviceCode: 'PAC',
      zone: '',
      filename: ''
    },
    {
      serviceName: 'PACIFIC ISLAND SERVICE',
      serviceCode: 'PIS',
      zone: '',
      filename: 'Service_Framework_PIS.pdf'
    },
    {
      serviceName: 'POLYNESIA SERVICE',
      serviceCode: 'PLY',
      zone: '',
      filename: 'Service_Framework_PLY.pdf'
    },
    {
      serviceName: 'PACIFIC NORTH ASIA SERVICE',
      serviceCode: 'PNA',
      zone: '',
      filename: 'Service_Framework_PNA.pdf'
    },
    {
      serviceName: 'PAPUA NEW GUINEA SERVICE',
      serviceCode: 'PNG',
      zone: '',
      filename: 'Service_Framework_PNG.pdf'
    },
    /* {
      serviceName: 'SOUTH EAST ASIA PNG AU',
      serviceCode: 'SPA',
      zone: '',
      filename: ''
    },*/
    {
      serviceName: 'TRANS TASMAN SERVICE',
      serviceCode: 'TRT',
      zone: '',
      filename: 'Service_Framework_TRT.pdf'
    },
    {
      serviceName: 'NORTH WEST AUSTRALIA DIRECT',
      serviceCode: 'NWD',
      zone: '',
      filename: 'Service_Framework_NWD.pdf'
    }
  ];
  public static readonly directionBunds = [
    {
      key: 's',
      name: 'South'
    },
    {
      key: 'n',
      name: 'North'
    },
    {
      key: 'e',
      name: 'East'
    },
    {
      key: 'w',
      name: 'West'
    }
  ];
  public static readonly firstGroupData = [
    {
      order: '2',
      label: 'Send as email',
      checked: false,
      disabled: false,
      key: 'email'
    },
    {
      order: '1',
      label: 'Download PDF',
      checked: true,
      disabled: false,
      key: 'download'
    }
  ];
  public static readonly secondGroupData = [
    /*{
      order: '1',
      label: 'Selected results',
      checked: true,
      disabled: false,
      key: 'selectedResults'
    }, */
    {
      order: '1',
      label: 'Full service schedule',
      checked: false,
      disabled: true,
      key: 'fullServiceSchedule'
    },
    {
      order: '2',
      label: 'Service info',
      checked: true,
      disabled: false,
      key: 'serviceInfo'
    }
  ];
  /** One Day in milliseconds */
  public static readonly oneDay = 1000 * 60 * 60 * 24;
  /** Returns true if the object is empty */
  public static isEmpty(obj: any): boolean {
    if (!obj) {
      return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
  /** method checks whether the date passed in are less than 1 day apart.
   * This is because of the fact that when we initialise the date, it initialises with today's time
   * as well. When we add days, we get the new date ( but the time remains same.)
   * This function is mainly used in date comparision w.r.t minimum arrival date.
   * e.g.  you use this app on 1stMay at 20:00 hours ( and dont change departure date).
   * You add 7 days ( 1 week departure flexibity )
   * you get new date as 8thMay 06:00 hours. (Min arrival date - 8th May)
   * Now you select arrival date as  8th may from the calender
   * ( date selected via calender is always set to 00:00).
   * If you do calculation whether departure and arrival date are 7 days apart,it'll return false
   * as dates are 6 days and 18hours (as even time is used in calculation). So any date which is less than 24 hours
   * apart is valid. dates which are 24hours or more than 24hours are invalid.
   */
  public static isDateInRange(
    smallerDate: number,
    biggerDate: number
  ): boolean {
    if (isNaN(smallerDate) || isNaN(biggerDate)) {
      return true;
    }
    if (smallerDate - biggerDate < Utils.oneDay) {
      return true;
    } else {
      return false;
    }
  }

  public static getServiceCodeFromServiceName(name: string): string {
    const index = this.SERVICE_CODE_SERVICE_NAME_MAPPING.findIndex(s => {
      return s.serviceName.toLowerCase() === name.toLowerCase();
    });
    if (index === -1) {
      return '';
    } else {
      return this.SERVICE_CODE_SERVICE_NAME_MAPPING[index].serviceCode;
    }
  }
  public static emailNDownloadService(
    file,
    serviceMap,
    filename,
    email,
    download,
    recipient,
    fromEmail
  ): FormData {
    const formdata = new FormData();
    if (file) {
      formdata.append('files', file, filename);
    } else {
      formdata.append(
        'files',
        new Blob([], {
          type: 'application/pdf'
        }),
        filename
      );
    }

    formdata.append(
      'serviceMap',
      new Blob([JSON.stringify(serviceMap)], {
        type: 'application/json'
      })
    );
    formdata.append(
      'emailRequest',
      new Blob(
        [
          JSON.stringify({
            fromEmail,
            toEmail: recipient.to,
            subject: recipient.subject,
            message: recipient.message,
            email,
            download
          })
        ],
        {
          type: 'application/json'
        }
      )
    );
    return formdata;
  }
  public static getServiceDetails() {
    return this.SERVICE_CODE_SERVICE_NAME_MAPPING;
  }
  public static getFileName(serviceCode: string) {
    const index = this.SERVICE_CODE_SERVICE_NAME_MAPPING.findIndex(s => {
      return s.serviceCode.toLowerCase() === serviceCode.toLowerCase();
    });
    if (index === -1) {
      return '';
    } else {
      return this.SERVICE_CODE_SERVICE_NAME_MAPPING[index].filename;
    }
  }

  public static getFormattedDate(date: Date) {
    const month =
      date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    const day = date.getDate();
    const year = date.getFullYear();
    const dateFormat = year + '-' + month + '-' + day;
    return dateFormat;
  }

  public static getDateAfterWeek(date: Date, week) {
    const toDate = date;
    const toDateMs = 7 * week * 24 * 60 * 60 * 1000;
    toDate.setTime(toDate.getTime() + toDateMs);
    return this.getFormattedDate(toDate);
  }
  public static processCountryData(regionData: any): any {
    regionData = regionData.filter(
      (item, index, self) =>
        self.findIndex(
          t =>
            t.countryName === item.countryName &&
            t.countryCode === item.countryCode
        ) === index
    );
    return regionData;
  }
}
export enum CAPACITY_STATUS {
  gray = -1,
  green = 1,
  orange = 2,
  red = 3
}
