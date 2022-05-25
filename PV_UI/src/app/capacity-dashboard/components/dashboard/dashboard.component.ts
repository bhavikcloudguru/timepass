import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { Utils } from 'src/app/common/utilities/Utils';
import { Subscription, interval } from 'rxjs';
import { EventDispatcherService } from 'src/app/shared/api-service/event-dispatcher/event-dispatcher.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public favourites = [];
  public countryData;
  public favouritePorts = [];
  public userClaims;
  public portList;
  private subscriptions: Subscription = new Subscription();
  public showLoader;
  public infoDate = new Date();
  public readonly dateFormat = 'dd LLL yyyy';
  public timeInterval;
  constructor(public dataService: DataService, public loader: LoaderService) {}
  public initialFilterValue = { value: 'estDeparture', order: 1 };
  /** The initial filter value */
  /** the currently selected filter , set to initial value */
  public currenrtlySelectedFilter = { ...this.initialFilterValue };
  /** List of sort by options */
  public sortByFilterList: { view: string; value: string }[] = [
    {
      view: 'Service',
      value: 'serviceCode'
    },
    {
      view: 'Vessel',
      value: 'vesselName'
    },
    {
      view: 'Voyage',
      value: 'voyageNumber'
    },
    {
      view: 'Leg',
      value: 'leg'
    },
    {
      view: 'Capacity Status',
      value: 'capacityStatus'
    },
    {
      view: 'Est departure',
      value: 'estDeparture'
    }
  ];

  ngOnInit(): void {
    this.showLoader = true;
    this.subscriptions.add(
      EventDispatcherService.getObservable(
        EventDispatcherService.ON_GET_USER_DETALS
      ).subscribe(v => {
        if (v) {
          this.initializeData();
          this.initializeInterval();
        }
      })
    );
    // this.initializeData();
  }

  public initializeInterval(): void {
    this.timeInterval = interval(1000 * 60 * 60);
    this.subscriptions.add(
      this.timeInterval.subscribe(val => {
        this.refreshList();
      })
    );
  }

  public initializeData(): void {
    this.userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (this.userClaims) {
      this.dataService.getPortListForScheduleSearch().subscribe(response => {
        if (response && response.length) {
          this.portList = response;
          this.getFavList();
        }
      });
    }
  }

  public getFavList(): void {
    this.showLoader = false;
    this.loader.show();
    this.infoDate = new Date();
    let fromDate = new Date();
    let fDate = Utils.getFormattedDate(fromDate);
    let toDate = Utils.getDateAfterWeek(fromDate, 25);
    let favData = {
      fromdate: fDate,
      todate: toDate,
      emailId: this.userClaims.email
    };
    this.dataService.getFavouriteMinData(favData).subscribe(response => {
      this.loader.hide();
      this.showLoader = false;
      this.favouritePorts = response.capacityData;
      if (this.favouritePorts?.length) {
        this.favouritePorts = this.favouritePorts.map(item => {
          return { ...item, capacityService: [], isSelected: false };
        });
      }
      this.countryData = this.processCountryData(this.portList);

      this.onSelectSort(this.currenrtlySelectedFilter);
      if (this.portHistory.length) {
        this.updateExistingPorts();
      }
    });
  }

  public updateExistingPorts(): void {
    this.favourites.forEach(fav => {
      let findFromHistroy = this.portHistory.find(
        item => fav.portCode === item.portCode
      );
      if (findFromHistroy) {
        fav['capacityService'] = findFromHistroy.capacityService;
        fav.isSelected = true;
      }
    });
  }

  public processCountryData(data) {
    const groupedData = {};
    this.favourites = [];
    for (const item of data) {
      if (item && item.countryName) {
        const getPort = this.favouritePorts.find(
          _p => _p.portCode === item.portCode
        );
        const port = {
          countryName: item.countryName,
          countryCode: item.countryCode,
          portName: item.portName,
          portCode: item.portCode
        };
        if (getPort) {
          port['favourites'] = true;
          port['capacityService'] = getPort.capacityService;
          port['isSelected'] = getPort.isSelected;
          this.favourites.push(port);
        }
        const countryName = item.countryName;
        if (!groupedData[countryName]) {
          groupedData[countryName] = [];
          groupedData[countryName].push(port);
          groupedData[countryName].className =
            AppConstants.FAVOURITES_STAR_LINE;
        } else {
          const cData = groupedData[countryName];
          const findPort = cData.find(
            cdata => cdata.portCode === item.portCode
          );
          if (!findPort) {
            groupedData[countryName].push(port);
          }
        }
      }
    }
    return groupedData;
  }

  public refreshList(): void {
    let ports = [...this.favourites]
      .filter(item => {
        return item.isSelected;
      })
      .map(data => {
        return data.portCode;
      });
    if (ports.length) {
      this.getFavouritesByPort(ports);
    }
  }

  public getFavouritesByPort(ports) {
    let fromDate = new Date();
    let fDate = Utils.getFormattedDate(fromDate);
    let toDate = Utils.getDateAfterWeek(fromDate, 25);
    let favData = {
      fromdate: fDate,
      todate: toDate,
      emailId: this.userClaims.email
    };
    let portSelectRequest = {
      portList: ports,
      userFavorite: favData
    };
    this.loader.show();
    this.dataService
      .getFavouriteByPorts(portSelectRequest)
      .subscribe(response => {
        this.loader.hide();
        if (response && response.capacityData) {
          let capcityData = response.capacityData;
          this.favourites.forEach(fav => {
            let selectPort = capcityData.find(
              port => fav.portCode === port.portCode
            );
            if (selectPort) {
              fav['capacityService'] = selectPort.capacityService;
              fav.isSelected = true;
            }
          });
        }
      });
  }

  public portHistory = [];
  public addToFavourites(details): void {
    const favData = {};
    favData['userEmailId'] = this.userClaims.email;
    favData['portCode'] = details.portCodes;
    favData['operation'] = details.operation;
    this.dataService.postFavouriteData(favData).subscribe(result => {
      if (result) {
        //this.getFavList();
        this.portHistory = [...this.favourites].filter(item => {
          return item.isSelected;
        });
        this.getFavList();
      }
    });
  }

  public removeFromFavourites(port): void {
    const details = {
      portCodes: [port.portCode],
      operation: 'delete'
    };
    this.addToFavourites(details);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  public arrow($event: {
    event;
    value: string;
    direction;
    index: number;
  }): void {
    const event = $event.event;
    const value = $event.value;
    const direction = $event.direction;
    const index = $event.index;
    this.currenrtlySelectedFilter.order = direction === 'up' ? 1 : -1;

    /** We stop event propagation as arrows are child of mat select options.
     * If we dont stop propagation, even the option click event will be fired.s
     */
    event.stopPropagation();
    this.currenrtlySelectedFilter = {
      ...this.currenrtlySelectedFilter,
      value: ''
    };
    // This is so that one change detection cycle passes by
    setTimeout(() => {
      this.currenrtlySelectedFilter = {
        ...this.currenrtlySelectedFilter,
        value
      };

      this.onSelectSort(this.currenrtlySelectedFilter);
    }, 5);
  }
  /** Sort the original scheduels based on the currently selected filter */
  public onSelectSort(filter: { value: string; order: number }) {
    this.favourites.map(f => {
      const capacityService = f.capacityService.sort((o1, o2) =>
        this.compare(o1, o2, filter.value, filter.order)
      );
      return {
        ...f,
        capacityService
      };
    });
    // This is so that one change detection cycle passes by
    setTimeout(() => {
      this.favourites = [...this.favourites];
    }, 5);
  }
  public compare(object1, object2, property: string, order: number): number {
    let comparator = order;
    let d1 = object1[property] || '';
    let d2 = object2[property] || '';

    if (property === 'estDeparture') {
      d1 = new Date(object1[property]);
      d2 = new Date(object2[property]);
    }
    if ('voyageNumber' === property) {
      d1 = parseInt(object1[property], 10) || 0;
      d2 = parseInt(object2[property], 10) || 0;
    }
    if (d1 > d2) {
      comparator *= 1;
    } else if (d1 < d2) {
      comparator *= -1;
    } else {
      comparator = comparator *= 0;
    }

    return comparator;
  }

  public getServiceName(code: string): any {
    let serviceName;
    const getAllServices = Utils.getServiceDetails();
    const service = getAllServices.find(_i => _i.serviceCode === code);
    if (service) {
      serviceName = service.serviceName;
    }
    return serviceName;
  }

  public selectPort(port) {
    if (port.isSelected) {
      port.capacityService = [];
      port.isSelected = false;
    } else {
      let ports = [port.portCode];
      this.getFavouritesByPort(ports);
    }
  }
}
