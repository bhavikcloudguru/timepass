import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogPopupComponent } from './../../shared/dialog-popup/dialog-popup.component';
import { Utils } from './../../common/utilities/Utils';
import { Subject, scheduled } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as filesaver from 'file-saver';
import { formatDate } from '@angular/common';

import { BrowseService } from 'src/app/shared/api-service/browse/browse.service';
import { TrafficStatusComponent } from 'src/app/shared/components/traffic-status/traffic-status.component';
import { NotesPopupComponent } from '../components/notes-popup/notes-popup.component';
import { TrafficStatus } from '../models/traffic-status.model';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { FeedbackComponent } from 'src/app/shared/components/feedback/feedback.component';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  /** This subject will be used to unsubscribe all observables in this component */
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public serviceCode: string;
  public serviceName: string;
  public serviceDetails: any;
  private loggedInUserEmail = 'no-reply@swirecnco.com';
  public isReadOnly = false;
  public isAccessDenied = false;
  public capacityReadMode = false;
  /** LIst of ports present in the details list */
  portlist = [];
  /** list of vessels from the details list */
  vesselList = [];
  isEmptyResults = false;
  private pdfUrl: any;
  public trafficServiceData: any;
  public displayedColumns: Array<any>;
  private dataSource: any;
  public showLoader = false;
  public hidePdfIcon = false;

  public portGroup;
  public vesselGroup;
  public trafficDataGroup = {};
  public trafficVesselGroup = {};
  public fromDate;
  public toDate;

  public isEditAccessible = false; // Is edit accessible.
  public isEditEnabled = false; // Is edit enabled?

  constructor(
    public activatedRoute: ActivatedRoute,
    private dataService: DataService,
    public dialog: MatDialog,
    private router: Router,

    private browseService: BrowseService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.serviceCode = activatedRoute.snapshot.paramMap.get('serviceCode');
    this.serviceName = activatedRoute.snapshot.paramMap.get('serviceName');
    // temp code for hide pacifica service pdf url.
    const hiddenServices = ['PAC'];
    this.hidePdfIcon = hiddenServices.includes(this.serviceCode);
    // end
  }
  private async getLoggedInUserEmailId() {
    const userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userClaims && userClaims.email) {
      this.loggedInUserEmail = userClaims.email;
    }
  }
  ngOnInit(): void {
    this.getServicesByServiceCode();
    this.getLoggedInUserEmailId();
    this.fromDate = new Date();
    this.toDate = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  public getVesselGroupData(dataGroup: any): void {
    for (const key in dataGroup) {
      if (dataGroup.hasOwnProperty(key)) {
        let element = dataGroup[key];
        const largestValue = this.largestVesselsGroup(element);
        element.largest = largestValue;
        element = this.browseService.getVessels(element);
      }
    }
    this.vesselGroup = dataGroup;
  }

  public getCapacityLightsData(dataGroup: any, portGroup: any) {
    for (const key in dataGroup) {
      if (dataGroup.hasOwnProperty(key)) {
        const element = dataGroup[key];
        const port = portGroup[key];
        const traficData = this.browseService.processData(element, port);
        if (traficData && traficData.ports) {
          const displayCol = traficData.vessels.map(a => a.label);

          const data = {
            trafficServiceData: traficData,
            displayedColumns: displayCol
          };
          this.trafficDataGroup[key] = data;
        }
      }
    }
  }

  getServicesByServiceCode() {
    this.isEmptyResults = false;
    this.showLoader = true;
    this.dataService.getServiceDetailsByServiceCode(this.serviceCode).subscribe(
      (data: any[]) => {
        this.showLoader = false;
        if (data && data.length > 0) {
          this.pdfUrl =
            data[data.length - 1].pdfUrl + Utils.getFileName(this.serviceCode);
        }
        data = data.sort(
          (a, b) =>
            new Date(a.arrivalDate).getTime() -
            new Date(b.arrivalDate).getTime()
        );

        this.portlist = this.browseService.unique(data, 'portCode');

        const directionGroups = {};
        const portGroups = {};
        data.forEach(element => {
          if (element.voyageNumber) {
            const directionL =
              element.voyageNumber[element.voyageNumber.length - 1];
            const direction = this.getDirection(directionL);
            if (directionGroups[direction]) {
              directionGroups[direction].push(element);
            } else {
              directionGroups[direction] = [element];
            }
          }
        });
        /// group sorting
        const vesselGroup = {};
        for (const key in directionGroups) {
          if (directionGroups.hasOwnProperty(key)) {
            const element = this.setVesselsWithDirection(directionGroups[key]);
            vesselGroup[key] = element;
            let _l = 0;
            let _largestArray;
            for (const _e of element) {
              if (_l < _e.value.length) {
                _l = _e.value.length;
                _largestArray = _e;
              }
            }
            const _result = this.browseService.sortArrays(
              this.portlist,
              _largestArray.value,
              'portCode'
            );
            portGroups[key] = _result;
          }
        }

        this.portGroup = portGroups;
        if (this.portlist.length === 0) {
          this.isEmptyResults = true;
        }
        this.getVesselGroupData(vesselGroup);
        this.getCapacityLightsData(directionGroups, this.portGroup);
      },
      error => {
        this.showLoader = false;
        this.isEmptyResults = true;
        console.log(error);
      }
    );
  }

  public setVesselsWithDirection(data) {
    const vesselList = [];
    data.forEach(element => {
      const portCode = element.portCode;
      const vesselCode = element.vesselCode;
      const voyageNumber = element.voyageNumber;
      let obj;
      if (vesselCode) {
        const id = vesselList.findIndex(
          v => v.code === vesselCode && v.voyageNumber === voyageNumber
        );
        if (id === -1) {
          obj = {
            code: vesselCode,
            value: [],
            voyageNumber,
            vesselName: element.vesselName
          };
          vesselList.push(obj);
        } else {
          obj = vesselList[id];
        }
        obj.value.push(element);
      }
    });
    return vesselList;
  }

  /** Get departure date which corresponds to the port value being passed. */
  getValue(value, port) {
    const id = value.findIndex(v => v.portCode === port);
    if (id === -1) {
      return '';
    } else {
      return (
        formatDate(value[id].arrivalDate, 'dd LLL', 'en-US') +
        ' - ' +
        formatDate(value[id].departureDate, 'dd LLL', 'en-US')
      );
    }
  }
  // on click of pdf image it opens in new tab
  open() {
    window.open(this.pdfUrl, '_blank');
  }
  // opens popup model on click of Export buton (detail component export button)
  public openDialog() {
    const dialogRef: MatDialogRef<DialogPopupComponent> = this.dialog.open(
      DialogPopupComponent,
      {
        width: '616px',
        data: {
          comp: 'browse-service',
          firstGroupData: Utils.firstGroupData,
          secondGroupData: Utils.secondGroupData.filter(
            d => d.label !== 'Selected results'
          ),
          pdfUrl: this.pdfUrl
        }
      }
    );
    // The user  can't close the dialog by clicking outside its body
    // dialogRef.disableClose = true;
    dialogRef.componentInstance.exportClicked
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => {
        if (s.selectedFilters['email']) {
          const serviceMap = {};
          serviceMap[Utils.getFileName(this.serviceCode)] = this.pdfUrl;

          this.emailNDownloadService(
            null,
            serviceMap,
            '',
            true,
            false,
            s.recipient
          );
          dialogRef.close();
        }
        if (s.selectedFilters['download']) {
          this.downloadPdf(this.pdfUrl, dialogRef);
        }
      });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  /** Download the PDF service info and close the dialog */
  downloadPdf(pdfUrl: string, dialogRef: MatDialogRef<DialogPopupComponent>) {
    this.dataService.getBlobData(pdfUrl).subscribe(s => {
      filesaver.saveAs(
        new Blob([s], { type: 'application/pdf' }),
        Utils.getFileName(this.serviceCode)
      );
      dialogRef.close();
    });
  }
  redirectTo(url: string, port: string) {
    this.router.navigate([url, { port }]);
  }
  // navigates back to browse-service dashboard page
  navigateBack(url: string) {
    this.router.navigate([url]);
  }

  public vesselSelection(event) {
    for (const key in this.vesselGroup) {
      if (Object.prototype.hasOwnProperty.call(this.vesselGroup, key)) {
        const vessels = this.vesselGroup[key];
        for (const vessel of vessels) {
          let item = event[key].find(_v => _v.code === vessel.code);
          vessel.display = item.isChecked;
        }
      }
    }
  }

  /** This function calls the service where the generated file is uploaded
   * and emailed along with service info pdfs.
   * In case download is true,  service info pdfs are downloaded
   */
  private emailNDownloadService(
    file,
    serviceMap,
    filename,
    email,
    download,
    recipient
  ) {
    const formdata = Utils.emailNDownloadService(
      file,
      serviceMap,
      filename,
      email,
      download,
      recipient,
      this.loggedInUserEmail
    );
    this.dataService.postBlobData(formdata).subscribe(s => console.log(s));
  }

  /** Traffic Data */

  public openNotesDialog(trafficServiceData): void {
    let filteredData = [];
    filteredData = trafficServiceData.value;
    const dialogRef = this.dialog.open(NotesPopupComponent, {
      width: '616px',
      data: {
        serviceName: this.serviceName,
        trafficData: filteredData,
        isReadOnly: this.isReadOnly,
        isAccessDenied: this.isAccessDenied,
        readMode: this.capacityReadMode
      },
      scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const trafficData: Array<any> = [];
        for (const item of result) {
          const trafficStatus = new TrafficStatus();
          trafficStatus.portCode = item.portCode;
          trafficStatus.voyageNumber = item.voyageNumber;
          trafficStatus.vesselCode = item.vesselCode;
          trafficStatus.departureDate = item.departureDate;
          trafficStatus.trafficStatus = item.trafficStatus;
          trafficStatus.vesselName = item.vesselName;
          trafficStatus.notes = item.notes;
          trafficStatus.serviceCode = item.serviceCode;
          trafficStatus.direction = item.direction;
          trafficData.push(trafficStatus.toJson());
        }

        this.browseService.postServiceList(trafficData).subscribe(
          res => {
            if (res && res.length) {
              const notes = res[0].notes;
              trafficServiceData.notes = notes ? true : false;
            }
          },
          error => {
            console.log(error);
          }
        );
      }
    });
  }

  public largestVesselsGroup(vessels) {
    let _l = 0;
    let _largestArray;
    for (const _e of vessels) {
      if (_l < _e.value.length) {
        _l = _e.value.length;
        _largestArray = _e;
      }
    }
    return _largestArray && _largestArray.value
      ? _largestArray.value.length
      : 0;
  }

  public selectTrafficItem(status, data) {
    const trafficData: Array<any> = [];
    const trafficStatus = new TrafficStatus();
    trafficStatus.portCode = data.portCode;
    trafficStatus.voyageNumber = data.voyageNumber;
    trafficStatus.vesselCode = data.vesselCode;
    trafficStatus.departureDate = data.departureDate;
    trafficStatus.trafficStatus = status;
    trafficStatus.vesselName = data.vesselName;
    trafficStatus.notes = data.notes;
    trafficStatus.direction = data.direction;
    trafficStatus.serviceCode = data.serviceCode;
    trafficData.push(trafficStatus.toJson());

    this.browseService.postServiceList(trafficData).subscribe(
      res => {
        if (res.length) {
          data.trafficStatus = res[0].capacityTrafficStatus;
          data.show = 'completed';
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  public markAsReadOnly(readOnly: boolean) {
    // console.log('markAsReadOnly', readOnly);
    this.isReadOnly = readOnly;
    this.isEditAccessible = !readOnly;
    this.changeDetectorRef.detectChanges();
  }
  public markAsAccessDenied(accessDenied: boolean) {
    this.isAccessDenied = accessDenied;
    this.isEditAccessible = !accessDenied;
    this.changeDetectorRef.detectChanges();
  }
  public getDirection(key) {
    const bound = Utils.directionBunds.find(
      item => item.key.toLowerCase() === key.toLowerCase()
    );
    return bound.name;
  }

  public openFeedbackForm(): void {
    const currentlyLoggedInUserInfoKeyCloak =
      Utils.currentlyLoggedInUserInfoKeyCloak;
    if (currentlyLoggedInUserInfoKeyCloak) {
      const dialogRef: MatDialogRef<FeedbackComponent> = this.dialog.open(
        FeedbackComponent,
        {
          width: '616px',
          data: {
            username: currentlyLoggedInUserInfoKeyCloak.userClaims.name,
            emailId: currentlyLoggedInUserInfoKeyCloak.userClaims.email,
            type: AppConstants.FEEDBACK_GENERAL_TYPE
          },
          scrollStrategy: new NoopScrollStrategy()
        }
      );
      dialogRef.afterClosed().subscribe(result => {});
    }
  }

  public mouseActionView(action, schedule, selectedVessel, group) {
    if (action === 'enter') {
      for (const vessel of group) {
        if (
          vessel.code === selectedVessel.code &&
          vessel.voyageNumber === selectedVessel.voyageNumber
        ) {
          for (const _v of vessel.value) {
            if (_v.portCode === schedule.portCode) {
              _v.show = true;
            } else {
              _v.show = false;
            }
          }
        } else {
          for (const _ve of vessel.value) {
            _ve.show = false;
          }
        }
      }
    } else if (action === 'leave') {
      schedule.show = false;
    }
  }

  public toggle(event) {
    this.isEditEnabled = !this.isEditEnabled;
    this.capacityReadMode = this.isEditEnabled;
  }
}
