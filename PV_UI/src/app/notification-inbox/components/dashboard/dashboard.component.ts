import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { DataService } from 'src/app/data.service';
import { EventDispatcherService } from 'src/app/shared/api-service/event-dispatcher/event-dispatcher.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/common/utilities/Utils';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { NotificationService } from 'src/app/shared/api-service/notification/notification.service';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BookingAcceptanceComponent } from 'src/app/shared/components/booking-acceptance/booking-acceptance.component';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public notifications = [];
  public showLoader = false;
  public infoDate = new Date();
  public readonly dateFormat = 'dd LLL yyyy';
  public isReadOnly = false;
  public isAccessDenied = false;
  private subscriptions: Subscription = new Subscription();
  public userClaims;
  public initialFilterValue = { value: 'creationTime', order: -1 };
  /** The initial filter value */
  /** the currently selected filter , set to initial value */
  public uniqueRequestors: { email: string; name: string }[] = [];
  public uniqueBookingStatuses = [];
  public currentlyOpenedPanel = []; // this holds the index of currently open panel
  public currenrtlySelectedSort = { ...this.initialFilterValue };
  public currentlySelectedRequestorFilter = [];
  public currentlySelectedStatusFilter = [];
  private originalRecords = [];
  public showFilters = false;
  public sortByFilterList: { view: string; value: string }[] = [
    {
      view: 'Created time',
      value: 'creationTime'
    },
    {
      view: 'Booking id',
      value: 'bookingId'
    },
    {
      view: 'Port code',
      value: 'pol'
    },
    {
      view: 'Vessel',
      value: 'vesselCode'
    },
    {
      view: 'Voyage',
      value: 'voyageNumber'
    },
    {
      view: 'Type',
      value: 'equipType'
    },
    {
      view: 'Total weight',
      value: 'totalWeight'
    },
    {
      view: 'Number of units',
      value: 'numberOfUnits'
    }
  ];
  @ViewChild(MatAccordion) accordion: MatAccordion;
  constructor(
    public dataService: DataService,
    public loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.subscriptions.add(
      EventDispatcherService.getObservable(
        EventDispatcherService.ON_GET_USER_DETALS
      ).subscribe(v => {
        if (v) {
          this.initializeData();
        }
      })
    );
    //    this.initializeData();
  }

  public initializeData(): void {
    this.loaderService.show();
    this.showFilters = false;
    this.userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    this.dataService
      .getBookingDetailsForEmailId(this.userClaims.email)
      .subscribe(
        result => {
          this.currentlyOpenedPanel = []; // close any expanded panel
          this.infoDate = new Date();
          this.loaderService.hide();
          this.notifications = result;
          this.originalRecords = result;
          this.originalRecords = this.originalRecords.map(r => {
            let volume = 0;
            let teu = 0;
            let isOnlyBulk = false;
            let isOnlyContainer = false;
            let bulk = r.cargo.filter(c => c.bulk);
            let container = r.cargo.filter(c => c.container);
            if (bulk.length > 0 && container.length == 0) {
              isOnlyBulk = true;
            }
            if (bulk.length == 0 && container.length > 0) {
              isOnlyContainer = true;
            }
            bulk.forEach(c => {
              volume = volume + c.rt;
            });
            container.forEach(c => (teu = teu + c.teu));
            let portCodes = [];
            let portCodesPortNames = [];
            let originPortCountry = '';
            let polPortCountry = '';
            let podPortCountry = '';
            let destinationPortCountry = '';
            if (r.originPort) {
              portCodes.push(r.originPort);
              portCodesPortNames = this.dataService.getPortCodeToName(
                portCodes
              );
              portCodes = [];
              if (portCodesPortNames && portCodesPortNames[0]) {
                originPortCountry =
                  portCodesPortNames[0].portName +
                  ' , ' +
                  portCodesPortNames[0].countryName;
              }
            }
            if (r.pol) {
              portCodes.push(r.pol);
              portCodesPortNames = this.dataService.getPortCodeToName(
                portCodes
              );
              portCodes = [];
              if (portCodesPortNames && portCodesPortNames[0]) {
                polPortCountry =
                  portCodesPortNames[0].portName +
                  ' , ' +
                  portCodesPortNames[0].countryName;
              }
            }
            if (r.pod) {
              portCodes.push(r.pod);
              portCodesPortNames = this.dataService.getPortCodeToName(
                portCodes
              );
              portCodes = [];
              if (portCodesPortNames && portCodesPortNames[0]) {
                podPortCountry =
                  portCodesPortNames[0].portName +
                  ' , ' +
                  portCodesPortNames[0].countryName;
              }
            }
            if (r.destinationPort) {
              portCodes.push(r.destinationPort);
              portCodesPortNames = this.dataService.getPortCodeToName(
                portCodes
              );
              portCodes = [];
              if (portCodesPortNames && portCodesPortNames[0]) {
                destinationPortCountry =
                  portCodesPortNames[0].portName +
                  ' , ' +
                  portCodesPortNames[0].countryName;
              }
            }

            return {
              ...r,
              volume,
              isOnlyContainer,
              isOnlyBulk,
              originPortCountry,
              polPortCountry,
              podPortCountry,
              destinationPortCountry,
              teu
            };
          });
          console.log('orign', this.originalRecords);
          this.notifications.forEach(n => {
            this.uniqueBookingStatuses.findIndex(
              u => u.status === n.bookingStatus
            ) == -1
              ? this.uniqueBookingStatuses.push({ status: n.bookingStatus })
              : '';
            this.uniqueRequestors.findIndex(
              u =>
                u?.email?.toLowerCase() === n.fromEmail?.emailId?.toLowerCase()
            ) == -1
              ? this.uniqueRequestors.push({
                  email: n.fromEmail?.emailId?.toLowerCase(),
                  name: n.fromEmail?.name
                })
              : {};
          });
          this.uniqueRequestors = [...this.uniqueRequestors];
          this.uniqueBookingStatuses = [...this.uniqueBookingStatuses];
          if (this.isReadOnly || this.isAccessDenied) {
            // CS Role
            this.currentlySelectedRequestorFilter = [
              ...this.uniqueRequestors
                .filter(
                  r =>
                    r.email.toLowerCase() ===
                    Utils.currentlyLoggedInUserInfoKeyCloak.userClaims.email.toLowerCase()
                )
                .map(r => {
                  return r.email;
                })
            ];
          } else {
            // CM role
            this.currentlySelectedRequestorFilter = [
              ...this.uniqueRequestors.map(r => {
                return r.email;
              })
            ];
          }
          this.currentlySelectedStatusFilter = [
            ...this.uniqueBookingStatuses.map(r => {
              return r.status;
            })
          ];
          this.currentlySelectedStatusFilter = ['SUBMITTED'];
          this.showFilters = true;
          this.notifications = this.notifications.sort((o1, o2) =>
            this.compare(o1, o2, 'bookingId', -1)
          );
          this.notifications = this.notifications.sort((o1, o2) =>
            this.compare(o1, o2, 'creationTime', -1)
          );
          const filter = this.notificationService.getSortElement();

          if (filter) {
            this.currenrtlySelectedSort = { ...filter };
            this.filterData();
          }
        },
        error => {}
      );
  }

  public onSelect(status: string, item: any, event: any): void {
    const userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    const statusJson = item;
    this.loaderService.show();
    statusJson.emailId = userClaims.email;
    let bulks = [...item.cargo].map(cargo => {
      return cargo.bulk;
    });
    statusJson.cargoType = bulks;
    switch (status) {
      case 'approve':
        statusJson.acceptanceStatus = 'ACCEPTED';
        break;
      case 'reject':
        statusJson.acceptanceStatus = 'REJECTED';
        break;
      case 'partial_accept':
        statusJson.acceptanceStatus = 'PARTIAL_ACCEPTANCE';
    }
    this.dataService.sendRequestStatus(statusJson).subscribe(response => {
      this.initializeData();
    });
    event.stopPropagation();
  }

  public markAsReadOnly(readOnly: boolean) {
    // console.log('markAsReadOnly', readOnly);
    this.isReadOnly = readOnly;
    this.changeDetectorRef.detectChanges();
  }
  public markAsAccessDenied(accessDenied: boolean) {
    this.isAccessDenied = accessDenied;
    this.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy() {
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
    this.currenrtlySelectedSort.order = direction === 'up' ? 1 : -1;

    /** We stop event propagation as arrows are child of mat select options.
     * If we dont stop propagation, even the option click event will be fired.s
     */
    event.stopPropagation();
    this.currenrtlySelectedSort = {
      ...this.currenrtlySelectedSort,
      value: ''
    };
    // This is so that one change detection cycle passes by
    setTimeout(() => {
      this.currenrtlySelectedSort = {
        ...this.currenrtlySelectedSort,
        value
      };

      this.filterData();
    }, 5);
  }
  /** Sort the original scheduels based on the currently selected filter */
  public filterData() {
    this.accordion?.closeAll();
    console.log(
      'filter',
      this.currentlySelectedRequestorFilter,
      this.currentlySelectedStatusFilter
    );
    this.currentlyOpenedPanel = [];
    const filter = this.currenrtlySelectedSort;
    this.notificationService.setSortElement(filter);
    let notifications = [...this.originalRecords]
      .filter(r => r)
      .sort((o1, o2) => this.compare(o1, o2, filter.value, filter.order));

    notifications = notifications.filter(
      nRequestor =>
        this.currentlySelectedRequestorFilter.findIndex(
          r => r?.toLowerCase() === nRequestor.fromEmail?.emailId?.toLowerCase()
        ) > -1
    );

    notifications = notifications.filter(
      nStatus =>
        this.currentlySelectedStatusFilter.findIndex(
          s => s === nStatus.bookingStatus
        ) > -1
    );

    // This is so that one change detection cycle passes by
    setTimeout(() => {
      this.notifications = notifications;
    }, 5);
  }
  public compare(object1, object2, property: string, order: number): number {
    let comparator = order;
    let d1 = object1[property] || '';
    let d2 = object2[property] || '';

    /*     if (property === 'estDeparture') {
      d1 = new Date(object1[property]);
      d2 = new Date(object2[property]);
    } */
    if ('voyageNumber' === property || 'totalWeight' === property) {
      d1 = parseInt(object1[property], 10) || 0;
      d2 = parseInt(object2[property], 10) || 0;
    }

    if ('bookingId' === property) {
      d1 = parseInt(object1[property].split('-')[1], 10) || 0;
      d2 = parseInt(object2[property].split('-')[1], 10) || 0;
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
  public setOpened(index) {
    if (this.currentlyOpenedPanel.indexOf(index) === -1) {
      this.currentlyOpenedPanel = [...this.currentlyOpenedPanel, index];
    }
  }
  public setClosed(index) {
    if (this.currentlyOpenedPanel.indexOf(index) !== -1) {
      this.currentlyOpenedPanel = this.currentlyOpenedPanel.filter(
        o => o !== index
      );
    }
  }

  public openUpdateView(bookingDetails: any): void {
    const dialogRef: MatDialogRef<BookingAcceptanceComponent> = this.dialog.open(
      BookingAcceptanceComponent,
      {
        width: '1084px',
        data: {
          portCode: bookingDetails.portCode,
          departureDate: bookingDetails.departureDate,
          details: bookingDetails,
          portList: []
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      this.initializeData();
    });
  }

  public submitRequest(
    status: string,
    bookingDetails: any,
    comments: string
  ): void {
    const acceptanceStatus =
      status === 'approve'
        ? 'ACCEPTED'
        : status === 'reject'
        ? 'REJECTED'
        : status === 'cancel'
        ? 'CANCELLED'
        : 'PARTIAL_ACCEPTANCE';
    this.openConfirmationView(
      status,
      acceptanceStatus,
      bookingDetails,
      comments
    );
  }

  public emitBulkAction(status) {
    const acceptanceStatus = status === 'approve' ? 'ACCEPTED' : 'REJECTED';
    const filteredData = [...this.notifications].filter(item => {
      return item.isSelected;
    });

    const statusJson = filteredData.map(bdata => {
      let bulks = [...bdata.cargo].map(cargo => {
        return cargo.bulk;
      });

      let jsn = {
        emailId: this.userClaims.email,
        bookingId: bdata.bookingId,
        acceptanceStatus: acceptanceStatus,

        notes: bdata.comment,
        cargoType: bulks
      };
      return jsn;
    });

    const dialogRef: MatDialogRef<ConfirmationComponent> = this.dialog.open(
      ConfirmationComponent,
      {
        width: '476px',
        data: {
          action: status,
          isBulk: true
          // notes: bookingDetails?.acceptanceNotes
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'yes') {
        this.loaderService.show();
        this.dataService.sendBulkRequestStatus(statusJson).subscribe(
          result => {
            this.loaderService.hide();
            if (result && result.isError) {
              setTimeout(() => {
                alert(
                  'Something went wrong while updating the booking. Please try again'
                );
                this.loaderService.hide();
              }, 10);
            } else {
              this.initializeData();
            }
          },
          error => {}
        );
      }
    });
  }

  public openConfirmationView(
    status: string,
    acceptanceStatus: string,
    bookingDetails: any,
    comments: string
  ) {
    const dialogRef: MatDialogRef<ConfirmationComponent> = this.dialog.open(
      ConfirmationComponent,
      {
        width: '476px',
        data: {
          action: status
          // notes: bookingDetails?.acceptanceNotes
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'yes') {
        this.takeActionOnBookingRequestWithComments(
          bookingDetails,
          acceptanceStatus,
          comments
        );
      }
    });
  }
  public takeActionOnBookingRequestWithComments(
    bookingDetails: any,
    acceptanceStatus: string,
    comments: string
  ): void {
    this.loaderService.show();
    if (!comments) {
      comments = '';
    }

    let bulks = [...bookingDetails.cargo].map(cargo => {
      return cargo.bulk;
    });
    const statusJson = {
      emailId: this.userClaims.email,
      bookingId: bookingDetails.bookingId,
      acceptanceStatus: acceptanceStatus,
      notes: comments,
      cargoType: bulks
    };
    this.dataService.sendRequestStatus(statusJson).subscribe(
      result => {
        if (result && result.isError) {
          setTimeout(() => {
            alert(
              'Something went wrong while updating the booking. Please try again'
            );
            this.loaderService.hide();
          }, 10);
        } else {
          this.initializeData();
        }
      },
      error => {}
    );
  }
  public ticketMarkAsRead(bookingId, item): void {
    this.userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (this.userClaims && this.userClaims.email) {
      item.userBookingsNotifications
        .filter(
          ubn =>
            ubn.id.emailId.toLowerCase() === this.userClaims.email.toLowerCase()
        )
        .forEach(ubn => (ubn.read = true));
      this.dataService
        .markAsRead(bookingId, this.userClaims.email, true)
        .subscribe(
          result => {
            // result
          },
          error => {}
        );
    }
  }

  public changeSelection(event) {
    this.notifications = [...this.notifications];
  }
}
