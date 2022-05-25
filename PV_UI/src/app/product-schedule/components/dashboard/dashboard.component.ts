import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/data.service';
import * as constants from '../../product-manager-constants';
import { DateAdapter } from '@angular/material/core';
import * as html2pdf from 'html2pdf.js';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ExportToPdfComponent } from '../../export-to-pdf/export-to-pdf.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogPopupComponent } from './../../../shared/dialog-popup/dialog-popup.component';
import { SelectionModel } from '@angular/cdk/collections';
import { Utils, CAPACITY_STATUS } from './../../../common/utilities/Utils';
import { ActivatedRoute } from '@angular/router';

import * as filesaver from 'file-saver';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { PdfExportService } from 'src/app/shared/api-service/pdf-export/pdf-export.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
/**
 * This is the root component for product-schedule module.
 * This is a SMART component. Most logic should reside here and not in the
 * child component. All the data needed by the child component should be present here
 * and should be sent to the child component through @Input
 * All communications by the child componet should be bubbled up with @Output upto this component.
 */
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  /** This subject will be used to unsubscribe all observables in this component */
  private destroy$: Subject<boolean> = new Subject<boolean>();
  /** This is the list of ports being sent to auto complete component. */
  public ports = [];
  /** the calender should start from today's date */
  public minDate = new Date();
  /** These are the options available in the sort by filter */
  public readonly sortByFilterList = [
    { value: 'departure', view: 'Departure' },
    { value: 'arrival', view: 'Arrival' },
    { value: 'pointToPointTransit', view: 'Point to point transit time' }
  ];

  /** The initial filter value */

  public initialFilterValue = { value: 'departure', order: 1 }; // 1 - ascending and -1 = descending
  /** the currently selected filter , set to initial value */
  public currenrtlySelectedFilter = { ...this.initialFilterValue };
  /** This will be the total number of schedules being fetched from the service. */
  private originalSchedules = [];
  /** THis holds schedules to be displayed in the infinite scroll. Starts with <=10 results */
  public schedules = [];
  /** Show the result on the result component */
  public showResults: boolean;
  /** This is the total number of results available */
  public totalResults = 0;
  /** SHow loading indicator */
  public showResultsLoading = false;
  /** Initializing selection model */
  public selection = new SelectionModel<any>(true, []);
  /** Data for the search Form */
  public searchFormData = {
    originPort: '',
    departureDate: this.minDate,
    departureFlexibility: 12,
    destinationPort: '',
    arrivalDate: new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000),
    maxTrans: 4,
    cargoWt: 0,
    cargoVolumeOption: 'TON'
  };
  public errorStatus: string;
  public readonly sliderMinMaxData = {
    sliderMax: 4,
    sliderMin: 0,
    sliderStep: 1,
    departureFlexibilityMin: 1,
    departureFlexibilityMax: 12
  };
  // disable autofocus when the port is already loaded through url
  public autoFocusOriginField = true;
  private pdfUrlMap = {};
  /** This is used to capture portCode from the url */
  private portCodeFromRoute = '';
  /** number of result being shown currently in the results section. */
  private resultsShown = 10;
  /** qr code for source */
  private qrCode: any;
  /** Agency details */
  private agencyDetails: any;
  public searchData: any;
  private loggedInUserEmail = 'no-reply@swirecnco.com';
  public co2Credit;
  private async getLoggedInUserEmailId() {
    const userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userClaims && userClaims.email) {
      this.loggedInUserEmail = userClaims.email;
    }
  }
  public ngOnInit(): void {
    // used to get logged in user information
    this.getLoggedInUserEmailId();
    /** Initialise the filter (sort by) */
    // this.initialiseFilter();
    // Get the list of ports for the dropdown
    this.getCo2CreditDetails();
    this.dataService.getPortListForScheduleSearch().subscribe(response => {
      if (response && response.length) {
        this.ports = response as any[];
        if (this.portCodeFromRoute) {
          const selectedPort = this.ports.filter(
            x => x.portCode === this.portCodeFromRoute
          )[0];
          this.searchFormData = {
            ...this.searchFormData,
            originPort: selectedPort
          };
          this.autoFocusOriginField = false;
        } else {
          this.autoFocusOriginField = true;
        }
      } else {
        this.ports = [];
      }
    });
  }
  public ngAfterViewInit() {}
  constructor(
    private dataService: DataService,
    private dateAdapter: DateAdapter<Date>,
    public dialog: MatDialog,
    private route: ActivatedRoute,

    public exportPdf: PdfExportService
  ) {
    const portCode = this.route.snapshot.paramMap.get('port');

    if (portCode) {
      this.portCodeFromRoute = portCode;
    }
  }

  public getCo2CreditDetails(): void {
    this.dataService.getCo2Credits().subscribe(res => {
      this.co2Credit = res;
    });
  }

  public saveCo2CreditDetails(event): void {
    this.dataService.postCo2Credits(event).subscribe(res => {
      console.log(res);
    });
  }

  /**
   * on click of search button based on this method results will be displayed
   * @ data
   */
  public checkSrchButtonClicked(data: { status: string; value: any }) {
    this.getLoggedInUserEmailId();
    // show the results only when status is valid and  size of the schedules is >0
    if (data.status === 'VALID') {
      this.selection = new SelectionModel<any>(true, []);
      this.originalSchedules = [];
      const params = this.mapParams(data.value);
      this.searchData = data.value;
      // Service call to the backend to get product schedules results
      this.showResultsLoading = true;
      /** Reset the filter to the inital default value */
      this.currenrtlySelectedFilter = { ...this.initialFilterValue };
      // this.initialiseFilter();
      this.dataService.getProductSchedule(params).subscribe((s: any) => {
        if (s && s.length >= 0) {
          this.minDate = new Date();
          this.showResultsLoading = false;
          this.showResults = true;
          this.pdfUrlMap = {};
          this.getPDFUrlMap(s);
          // this.populateArrivalDateForAllPortPairExceptOrigin(s);
          this.adjustSchedulesForInfiniteScroll(s);

          this.totalResults = this.originalSchedules.length;
          // Once the schudules are assigned, sort them with current filter
          this.onSelectSort(this.currenrtlySelectedFilter);

          this.getMostRestrictiveCapacityLightForRoute(this.originalSchedules);
          // Get the QR Code image incase the user selects to export pdf
          this.dataService
            .getBlobData(
              '/swire/qrcode/countrycode/' +
                this.searchFormData.originPort['countryCode']
            )
            .subscribe(ss => this.createImageFromBlob(ss));
          this.dataService
            .getAgencyDetails({
              destinationCityName: this.searchFormData.destinationPort[
                'cityName'
              ],
              destinationCountryName: this.searchFormData.destinationPort[
                'countryName'
              ],
              originCityName: this.searchFormData.originPort['cityName'],
              originCountryName: this.searchFormData.originPort['countryName']
            })
            .subscribe(s => {
              // ('getAgencyDetails', s);
              this.agencyDetails = s;
              this.agencyDetails['source'] = this.agencyDetails['origin'];
            });
        } else {
          this.totalResults = -1;
          this.showResults = true;
          this.showResultsLoading = false;
          this.errorStatus = s.statusText ? s.statusText : '';
        }
      });
    } else {
      this.showResults = false;
    }
  }
  /** Adjust schedules for infinite scroll
   * If you have 10 or less results, no infinite scroll, display all results at a time.
   * If you have 10+ results, show 10 results and then keep on adding 10 results whenever user scrolls
   */
  public adjustSchedulesForInfiniteScroll(s: any) {
    /** Adjust schedules for infinite scroll ---START */
    /** If the response is array, go ahead its SUCCESS. */
    if (s && s.length > 0) {
      this.originalSchedules = [...(s as any[])];
      this.resultsShown = 10;
      this.schedules = [];
      // If results >10, show only 10 results first. Rest on scroll
      if (this.originalSchedules.length > 10) {
        this.schedules = [...this.originalSchedules.slice(0, 10)];
      } else {
        // if results <=10, show all of them at once
        this.schedules = [...this.originalSchedules];
      }
      this.resultsShown = this.schedules.length;
    } else {
      // This means we didnt get schedules in response. Initialise them to blank array
      // to avoid any errors
      this.originalSchedules = this.schedules = [];
    }
    /** Adjust schedules for infinite scroll--END */
  }

  /**
   * This functions calls the sorting function based on Up/Down arrow selection.
   */
  public arrowClicked(event, value, type: string, index) {
    this.currenrtlySelectedFilter.order = type === 'up' ? 1 : -1;

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
    this.originalSchedules.sort((o1, o2) =>
      this.compare(o1, o2, filter.value, filter.order)
    );
    // This is so that one change detection cycle passes by
    setTimeout(() => {
      this.originalSchedules = [...this.originalSchedules];
      this.schedules = [
        ...this.originalSchedules.slice(0, this.schedules.length)
      ];
    }, 5);
  }
  /** the comparator function being used to sort */
  public compare(object1, object2, property: string, order: number): number {
    let comparator = order;
    let d1 = object1[property];
    let d2 = object2[property];

    if (property === 'arrival' || property === 'departure') {
      d1 = new Date(object1[property]);
      d2 = new Date(object2[property]);
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
  /** This function is used to append the records to the infinite scroll in the results component */
  public scrolled(e) {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    // The HTMLElement.offsetHeight read-only property returns the height of an element,
    // including vertical padding and borders, as an integer.
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    /* The Element.scrollHeight read-only property is a measurement of the height of an element's
   content, including content not visible on the screen due to overflow.*/
    const scrollLocation = e.target.scrollTop; // how far user scrolled
    /*The Element.scrollTop property gets or sets the number of pixels that an element's
      content is scrolled vertically.*/
    // If the user has scrolled within 50px of the bottom, add more data
    const buffer = 100;
    const limit = tableScrollHeight - (scrollLocation + tableViewHeight);

    if (buffer > limit) {
      // If original schedules length - results shown til now >10 ,
      // show 10 more results, others on further scroll
      if (this.originalSchedules.length - this.resultsShown > 10) {
        this.resultsShown += 10;
      } else {
        // If original schedules length - results shown til now <10 , show remaining.
        this.resultsShown = this.originalSchedules.length;
      }
      this.schedules = this.originalSchedules.slice(0, this.resultsShown);

      setTimeout(() => {
        this.schedules = [...this.schedules];
      }, 5);
      // Sort the additionally added records.
    } else {
      // Do nothing.
    }
  }
  /** THis method updates the search form data in the root component from the data emitted
   * by the child component
   */
  public updateSearchFormData(updatedValue: { [key: string]: any }) {
    this.searchFormData = { ...this.searchFormData, ...updatedValue };
  }
  /** convert searchForm params to search schedule params */
  private mapParams(value) {
    const params = {
      origin: value.originPort.portCode,
      fromdate: this.dateAdapter.format(value.departureDate, 'input'),
      departureFlexibility: value.departureFlexibility,
      destination: value.destinationPort.portCode,
      todate: this.dateAdapter.format(value.arrivalDate, 'input'),
      noOfTranshipment: value.maxTrans,
      mode: 'portpair',
      service: '',
      type: '',
      vessel: '',
      emailId: this.loggedInUserEmail
    };
    return params;
  }
  /** This method is called on click on export to PDF button */
  private exportToPDF(
    selectedRecords: any[],
    dialogRef: MatDialogRef<DialogPopupComponent>,
    selectedFilters,
    recipient
  ) {
    /** Get service code to pdf url map if service info is selected */
    const serviceMap = {};
    if (selectedFilters['serviceInfo']) {
      const uniqCodes = this.getUniqueServiceCodesFromRecords(selectedRecords);
      uniqCodes
        .filter(u => !!u)
        .forEach(u => {
          serviceMap[Utils.getFileName(u)] = this.pdfUrlMap[u];
        });
    }
    /** Get PDF if selected results is selected */
    if (selectedFilters['selectedResults']) {
      const source = selectedRecords[0].origin;

      const destination = selectedRecords[0].destination;
      const filename = source + '-' + destination + '(Customized).pdf';
      /** ::START::Data processing to send the call to external source. */
      /* let selectedRecordsToSend = [selectedRecords[0]];
      const totalProductsArray = [];
      selectedRecordsToSend = selectedRecordsToSend.map(recordToSend => {
        recordToSend = { ...recordToSend };
        selectedRecords.forEach(s => {
          const len = s['pairWiseDetails'].length;
          const singleProductArray = [];
          s['pairWiseDetails'].forEach((p, index) => {
            singleProductArray.push(p.first);
            if (index == len - 1) {
              singleProductArray.push(p.second);
            }
          });
          totalProductsArray.push(singleProductArray);
        });

        recordToSend['pairWiseDetails'] = totalProductsArray;
        return recordToSend;
      }); */
      /** ::END::Data processing to send the call to external source. */
      /* this.dataService
        .downloadPdf(selectedRecordsToSend, filename)
        .subscribe(s => {
          this.emailNDownloadService(
            s,
            serviceMap,
            filename,
            selectedFilters['email'],
            selectedFilters['download'],
            recipient
          );
          if (selectedFilters['download']) {
            filesaver.saveAs(
              new Blob([s], { type: 'application/pdf' }),
              filename
            );
          }
        }); */
      this.generatePDFForSelectedResults(selectedRecords).subscribe(async s => {
        if (!s) {
          return;
        }
        const pdf = await this.exportPdf.exportHTMLToPDF(
          {
            width: 1123,
            height: 794,
            name: 'a4',
            column: 6,
            scale: 3
          },
          s
        );
        filesaver.saveAs(
          new Blob([pdf], { type: 'application/pdf' }),
          filename
        );

        this.emailNDownloadService(
          pdf,
          serviceMap,
          filename,
          selectedFilters['email'],
          selectedFilters['download'],
          recipient
        );
        if (selectedFilters['download']) {
          filesaver.saveAs(
            new Blob([pdf], { type: 'application/pdf' }),
            filename
          );
        }
        dialogRef.close(); // close the export Dialog
      });
    } else {
      this.emailNDownloadService(
        null,
        serviceMap,
        '',
        selectedFilters['email'],
        selectedFilters['download'],
        recipient
      );
      dialogRef.close();
    }
  }
  public ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
  /**
   * opens popup model on click of Export buton (result component export button)
   */
  public openDialog($event) {
    const dialogRef: MatDialogRef<DialogPopupComponent> = this.dialog.open(
      DialogPopupComponent,
      {
        width: '616px',
        data: {
          comp: $event.comp,
          recordLength: $event.selectedRecords.length,
          firstGroupData: Utils.firstGroupData,
          secondGroupData: Utils.secondGroupData
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    // The user  can't close the dialog by clicking outside its body
    // dialogRef.disableClose = true;
    dialogRef.componentInstance.exportClicked
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => {
        this.exportToPDF(
          $event.selectedRecords,
          dialogRef,
          s.selectedFilters,
          s.recipient
        );
      });

    dialogRef.afterClosed().subscribe(result => {
      (document.activeElement as HTMLElement).blur();
    });
  }
  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.qrCode = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }
  private getPDFUrlMap(records) {
    const uniqServiceCodes = this.getUniqueServiceCodesFromRecords(records);

    uniqServiceCodes
      .filter(u => !!u)
      .forEach(serviceCode => {
        /* this.dataService
          .getServiceDetailsByServiceCode(serviceCode)
          .subscribe(s => {*/
        if (serviceCode) {
          this.pdfUrlMap[serviceCode] =
            records[0].pdfUrl + Utils.getFileName(serviceCode);
        }
        // });
      });
    console.log('pdfUrlMap', this.pdfUrlMap);
  }
  private getUniqueServiceCodesFromRecords(records): string[] {
    const uniqServiceCodes = [];
    records.forEach(r => {
      r.portPairList.forEach(rPortPairList => {
        if (rPortPairList.service) {
          const serviceCode = Utils.getServiceCodeFromServiceName(
            rPortPairList.service
          );
          if (uniqServiceCodes.indexOf(serviceCode) === -1) {
            uniqServiceCodes.push(serviceCode);
          }
        }
      });
    });
    return uniqServiceCodes;
  }
  private generatePDFForSelectedResults(selectedRecords) {
    const instance: MatDialogRef<ExportToPdfComponent> = this.dialog.open(
      ExportToPdfComponent,
      {
        panelClass: 'full-screen-modal',
        data: {
          selectedRecords: selectedRecords.sort((o1, o2) =>
            this.compare(o1, o2, 'departure', 1)
          ),
          qrCode: this.qrCode,
          agencyDetails: this.agencyDetails,
          originCountry: this.searchFormData.originPort['countryName'],
          destinationCountry: this.searchFormData.destinationPort['countryName']
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    return instance.componentInstance.innerHTML.pipe(takeUntil(this.destroy$));
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
    this.getLoggedInUserEmailId();

    const formData = Utils.emailNDownloadService(
      file,
      serviceMap,
      filename,
      email,
      download,
      recipient,
      this.loggedInUserEmail
    );
    this.dataService.postBlobData(formData).subscribe(s => console.log(s));
    if (download) {
      Object.keys(serviceMap).forEach(key => {
        this.downloadPdf(serviceMap[key], key);
      });
    }
  }

  downloadPdf(pdfUrl: string, serviceCode) {
    if (!serviceCode) {
      return;
    }
    this.dataService.getBlobData(pdfUrl).subscribe(s => {
      filesaver.saveAs(new Blob([s], { type: 'application/pdf' }), serviceCode);
    });
  }
  private getMostRestrictiveCapacityLightForRoute(schedules: any[]) {
    // debugger;
    schedules.forEach(schedule => {
      let restrictiveStatus = null;
      schedule.portPairList.forEach(ppl => {
        if (ppl.trafficStatus) {
          if (restrictiveStatus) {
            const x = this.capacityStatusComparator(
              restrictiveStatus,
              ppl.trafficStatus
            );
            restrictiveStatus = x > 0 ? restrictiveStatus : ppl.trafficStatus;
          } else {
            restrictiveStatus = ppl.trafficStatus;
          }
        }
      });

      schedule.mostRestrictiveCapacityStatus = restrictiveStatus;
    });
  }
  private capacityStatusComparator(status1, status2) {
    const status1intValue: number = parseInt(CAPACITY_STATUS[status1], 10);
    const status2intValuve: number = parseInt(CAPACITY_STATUS[status2], 10);
    return status1intValue - status2intValuve;
  }
}
