import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { ScheduleService } from 'src/app/shared/api-service/schedule/schedule.service';
import { DataService } from 'src/app/data.service';
import { ActivatedRoute, Router } from '@angular/router';
// import * as data from '../../../../assets/countries1.json';
import * as filesaver from 'file-saver';
import * as html2pdf from 'html2pdf.js';
import { ExportToPdfComponent } from '../export-to-pdf/export-to-pdf.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { map, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { PdfExportService } from 'src/app/shared/api-service/pdf-export/pdf-export.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { AlertMessageComponent } from 'src/app/shared/components/alert-message/alert-message.component';
import { AppMessages } from 'src/app/shared/app-constants/app-messages.model';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { Utils } from 'src/app/common/utilities/Utils';
import { EventDispatcherService } from 'src/app/shared/api-service/event-dispatcher/event-dispatcher.service';
import { DateAdapter } from '@angular/material/core';
import { MatDateRangePicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('pdf_export_candidate') innerHTML: ElementRef;
  public isSameOriginDestinationCountry = false;
  public selectedPort = []; // used for filtering.
  public originPorts = []; // used for filtering
  public destinationPorts = []; // used for filtering
  public originalServices = []; // used for filtering;
  public originalServicesGrouped = {};
  public orignalTranshipmentPorts = []; // used for filtering;
  public maxTranshippmentCount = 0;
  public originalTranshipmentCount = []; //used for filtering.
  public selectedCountries: any;
  public originData: {
    ports: { [key: string]: any }[];
    vessels: any[];
    displayedColumns: any[];
  } = {} as any;
  private originalCopy: any[] = [];
  public simpleView;
  public destinationData: any;
  public transshipmentData: any;
  public services: [];
  public showCheckboxes = false;
  // public results = [];
  public hasFeederService: boolean;
  public showLoader = true;
  public errorCondition = false;
  public transhipmentCount = [];
  public isMultipleCountries = false;
  @ViewChild('routemap')
  routemap: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  public expansionHeight;
  public totalCanvasHeight;
  public selectedServices: any[] = [];
  public selectedTranshipmentPorts: any[] = [];
  public selectedTranshipmentCount: any[] = [];
  public deselectedUniqueVesselsList: any[] = [];
  private tempDeselectedUniqueVesselsList: any[] = [];
  public qrCode;
  public transshipmentServices: any[] = [];
  public customerView = false;
  public isEditAccessible = true; // Is edit accessible.
  public isEditEnabled = false; // Is edit enabled?
  public selectedRange = { minValue: 0, maxValue: 0 } as any;
  public maxTranshippmentDuration = 0;
  public hideScroll = true;
  public translate = 0;
  public initializedResize = false;
  public showHideButtonText = 'Show/Hide Products';
  public showRestore = false;
  public originalStartDate;
  public originalEndDate;
  public selectedStartDate;
  public selectedEndDate;
  @ViewChild('picker', { read: MatDateRangePicker }) picker: MatDateRangePicker<
    Date
  >;
  constructor(
    public activatedRoute: ActivatedRoute,
    public scheduleService: ScheduleService,
    public dataService: DataService,
    private router: Router,
    public dialog: MatDialog,
    public exportPdf: PdfExportService,
    public loaderService: LoaderService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.initializedResize = true;
    this.setScrollDiv();
  }
  private async getLoggedInUserEmailId() {
    const userClaims = Utils?.currentlyLoggedInUserInfoKeyCloak?.userClaims;
    if (userClaims && userClaims.email) {
      return userClaims.email;
    }
    return '-';
  }
  public scheduleBuilder(): void {
    const getParams = this.activatedRoute.snapshot.paramMap
      .get('id')
      .split('__');
    const originCountries = getParams[0].split('-');
    const destinationCountries = getParams[1].split('-');
    const startDate = getParams[2];
    const endDate = getParams[3];
    this.selectedStartDate = this.originalStartDate = this.dateAdapter.parse(
      startDate,
      'yyyy-MM-dd HH:mm:ss'
    );
    this.selectedEndDate = this.originalEndDate = this.dateAdapter.parse(
      endDate,
      'yyyy-MM-dd HH:mm:ss'
    );

    this.selectedCountries = {
      origin: {
        countryCode: originCountries
          .reduce(this.reduceValues('countryCode'), '')
          .substring(1),
        countryName: originCountries
          .reduce(this.reduceValues('countryName'), '')
          .substring(1)
      },
      destination: {
        countryCode: destinationCountries
          .reduce(this.reduceValues('countryCode'), '')
          .substring(1),
        countryName: destinationCountries
          .reduce(this.reduceValues('countryName'), '')
          .substring(1)
      },
      originCountries,
      destinationCountries
    };
    this.isMultipleCountries =
      originCountries.length > 2 || destinationCountries.length > 2;
    const origin = { ports: [], countries: [] };
    const delivery = { ports: [], countries: [] };
    originCountries.forEach((value, i) => {
      const a = i % 2 === 0 ? origin.countries.push(value) : true;
    });
    destinationCountries.forEach((value, i) => {
      const a = i % 2 === 0 ? delivery.countries.push(value) : true;
    });

    const params = {
      origin,
      delivery,
      startDate: startDate,
      endDate: endDate,
      offset: new Date().getTimezoneOffset() * -1,
      emailId:
        Utils?.currentlyLoggedInUserInfoKeyCloak?.userClaims?.email || '-'
    };

    /* params['origin'] = getParams[0];
    params['destination'] = getParams[2];
    params['originType'] = 'country';
    params['destinationType'] = 'country';*/
    this.showLoader = true;
    this.getQrCode();
    this.errorCondition = false;
    this.dataService
      .getPortPairsForScheduleBuilder(
        params,
        this.activatedRoute.snapshot.paramMap.get('id').indexOf('____VSS') > -1
      )
      .subscribe(response => {
        this.displayErrorPopup(response);
        this.showLoader = false;
        if (response.error) {
          this.errorCondition = true;
          return;
        }
        // let response = (data as any).default;
        // console.log(response);
        // this.results = response;
        // We can have situations where there is no destination country
        // as we have same origin and destination country;
        response = response
          .filter(r => r.originCountry.length > 0)
          .map(r => {
            const originCountry = r.originCountry.map(aa => {
              const depDate = new Date(aa.departureDate);
              const arrDate = new Date(aa.arrivalDate);
              return { ...aa, depDate, arrDate };
            });
            const destinationCountry = r.destinationCountry.map(aa => {
              const depDate = new Date(aa.departureDate);
              const arrDate = new Date(aa.arrivalDate);
              return { ...aa, depDate, arrDate };
            });
            return { ...r, originCountry, destinationCountry };
          })
          // sort based on dept date ( for same dept date, consider arrival date)
          .sort((a, b) => {
            // get all dept dates in this product
            const depDateAs = [] as number[];
            const depDateBs = [] as number[];
            // get all arrival dates in thsi product
            const arrDateAs = [] as number[];
            const arrDateBs = [] as number[];
            a.originCountry.forEach(aa => {
              depDateAs.push(new Date(aa.departureDate).getTime());
              arrDateAs.push(new Date(aa.arrivalDate).getTime());
            });
            b.originCountry.forEach(aa => {
              depDateBs.push(new Date(aa.departureDate).getTime());
              arrDateBs.push(new Date(aa.arrivalDate).getTime());
            });

            const minDateA = Math.min(...depDateAs);
            const minDateB = Math.min(...depDateBs);
            const depDate = minDateA - minDateB;

            // if dep date is same, check arrival date
            if (depDate === 0) {
              const minArrDateA = Math.min(...arrDateAs);
              const minArrDateB = Math.min(...arrDateBs);
              const arrDate = minArrDateA - minArrDateB;

              return arrDate;
            } else {
              return depDate;
            }
          })
          // add country names for transhippments
          .map(t => {
            let transhipments = t.transhipments;
            if (transhipments && transhipments.length > 0) {
              transhipments = transhipments.map(tm => {
                const countryName = this.dataService.getCountryNameFromPortCode(
                  tm.previousPort.portCode
                );
                return {
                  ...tm,
                  previousPort: { ...tm.previousPort, countryName }
                };
              });
              return { ...t, transhipments };
            }
            return t;
          });
        this.originalCopy = [...response];
        this.isSameOriginDestinationCountry =
          response.filter(r => r.destinationCountry.length > 0).length === 0;

        this.processData(response, true);
      });
  }
  ngOnInit(): void {
    this.showLoader = true;
    /** This event is only emitted when the user details are fetched. So this subscription
     * makes sure that only valid users are allowed to perform actions
     */
    EventDispatcherService.getObservable(
      EventDispatcherService.ON_GET_USER_DETALS
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        if (v) {
          this.scheduleBuilder();
        }
      });
    //  this.scheduleBuilder();
  }
  public filterPorts(filteredPort: string[], results) {
    {
      const filteredOriginPort = filteredPort.filter(
        f => this.originPorts.filter(op => f === op.portCode).length > 0
      );
      const filteredDestinationPort = filteredPort.filter(
        f => this.destinationPorts.filter(op => f === op.portCode).length > 0
      );
      results = results.map(r => {
        let newObject = {} as any;
        const originCountry = r.originCountry.filter(oc => {
          return (
            filteredOriginPort.indexOf(oc.portCode) > -1 &&
            // present in selected filter and not a tranship port
            r.transhipments.findIndex(
              t => t.currentPort.portCode === oc.portCode
            ) === -1
          );
        });
        const destinationCountry = r.destinationCountry.filter(dc => {
          return (
            filteredDestinationPort.indexOf(dc.portCode) > -1 &&
            // present in selected filter and not a tranship port
            r.transhipments.findIndex(
              t => t.currentPort.portCode === dc.portCode
            ) === -1
          );
        });
        newObject = { ...r, origin, originCountry, destinationCountry };
        return newObject;
      });

      if (this.isSameOriginDestinationCountry) {
        results = results.filter(r => r.originCountry.length > 0);
      } else {
        results = results.filter(
          r => r.originCountry.length > 0 && r.destinationCountry.length > 0
        );
      }
    }

    // this.processData(results);
    return results;
  }

  processData(results: any[], isFirst?: boolean) {
    const _data = this.scheduleService.getScheduleDetails(results);
    if (isFirst) {
      this.originPorts = this.dataService.getPortCodeToName(_data.originPorts);
      this.destinationPorts = this.dataService.getPortCodeToName(
        _data.destinationPorts
      );
      this.originalServices = _data.totalServices;
      this.originalServicesGrouped[
        'Feeders services'
      ] = _data.totalServices.filter(f => f.feeder);
      this.originalServicesGrouped[
        'Swire services'
      ] = _data.totalServices.filter(f => !f.feeder);
      results.forEach(r => {
        if (r.totalTranshipmentDuration > this.maxTranshippmentDuration) {
          this.maxTranshippmentDuration = r.totalTranshipmentDuration;
        }
      });
      this.selectedRange.maxValue = this.maxTranshippmentDuration;
      const transhipments = _data.transhipments;
      transhipments.forEach(element => {
        //max transhipments
        if (this.maxTranshippmentCount < element.length) {
          this.maxTranshippmentCount = element.length;
        }
        // iterate over each transhipment port and get a list of uniq transhipment ports
        element.forEach(e => {
          this.orignalTranshipmentPorts.findIndex(
            t => t.portCode === e.currentPort.portCode
          ) === -1 && this.orignalTranshipmentPorts.push(e.currentPort);
        });
      });
      for (let i = 0; i <= this.maxTranshippmentCount; i++) {
        this.originalTranshipmentCount.push({ count: i + '' });
      }
    }
    console.log('_data', _data);
    this.originData.ports = _data.totalPorts;
    this.services = _data.totalServices;
    this.originData.displayedColumns = ['portName'];
    this.originData.vessels = [];
    results.forEach((r, i) => {
      const obj = {};
      const originVessel = r.uniqueVessels[0];
      const destinationVessel = r.uniqueVessels[r.uniqueVessels.length - 1];
      obj['origin_voyageNumber'] = originVessel.voyage_number;
      obj['origin_vesselName'] = r['originCountry'][0].vesselName;
      obj['origin_vesselName_feeder'] = r['originCountry'][0].feeder;
      obj['origin_service_code'] = originVessel.service_code;
      obj['origin_pf_bound'] = originVessel.pf_bound;

      if (r['destinationCountry'][0]) {
        obj['destination_vesselName'] = r['destinationCountry'][0].vesselName;
        obj['destination_vesselName_feeder'] =
          r['destinationCountry'][0].feeder;
        obj['destination_service_code'] = destinationVessel.service_code;
        obj['destination_pf_bound'] = destinationVessel.pf_bound;
        obj['destination_voyageNumber'] = destinationVessel.voyage_number;
      } else {
        obj['destination_vesselName'] = '';
        obj['destination_service_code'] = '';
        obj['destination_pf_bound'] = '';
        obj['destination_voyageNumber'] = '';
      }
      obj['uniqueVessels'] = r.uniqueVessels;
      this.originData.vessels.push(obj);
      obj['index'] = i + '';
      // if (isFirst) {
      obj['hideColumn'] = false;
      // }
      this.originData.displayedColumns.push(i + '');
    });
    this.hasFeederService = this.services.some(
      service => service['feeder'] === true
    );

    if (
      this.selectedCountries.origin.countryName ===
      this.selectedCountries.destination.countryName
    ) {
      let transhipments = [];
      this.originData.ports.some(element => {
        if (element['transhipments']) {
          transhipments = element['transhipments'];
          return true;
        }
      });
      if (transhipments.length === 0) {
        this.originData.ports.splice(-2, 2);
      }
    }

    this.setDraw();
    this.initializedResize = false;
    this.setScrollDiv();
  }
  public originalOrder(a, b) {
    return 1;
  }

  public setDraw() {
    let transhipments = [];
    this.originData.ports.some(element => {
      if (element['transhipments']) {
        transhipments = element['transhipments'];
        return true;
      }
    });
    this.transshipmentServices = [];
    for (const transships of transhipments) {
      if (transships) {
        for (const _tr of transships) {
          if (_tr && _tr.currentPort) {
            this.transshipmentServices.push(_tr.currentPort.serviceCode);
          }
          if (_tr && _tr.previousPort) {
            this.transshipmentServices.push(_tr.previousPort.serviceCode);
          }
        }
      }
    }

    const tCount = this.scheduleService.uniqueTransshipments(transhipments);
    let largest = 0;
    if (transhipments && transhipments.length) {
      largest = transhipments.reduce(
        (p, c, i, a) => (a[p] && a[p].length > c.length ? p : i),
        0
      );
      this.transhipmentCount = Array(transhipments[largest].length)
        .fill(1)
        .map((x, i) => i + 1);
    } else {
      largest = -1;
    }

    setTimeout(() => {
      /*** origin country data */

      const originServices = this.originData.ports.filter(
        item => item.type === 'originCountry'
      );
      const destinationServices = this.originData.ports.filter(
        item => item.type === 'destinationCountry'
      );
      const pServices = this.scheduleService.getCommonServices(
        originServices,
        destinationServices,
        this.services
      );

      const commonServices = pServices.commonServices;
      const transshipmentOnly = pServices.transshipmentOnly;

      let _tLength = largest >= 0 ? transhipments[largest].length * 220 : 0;
      let heightTranshipment = _tLength + 80;

      const rowExpansion = tCount * 30;
      if (rowExpansion > heightTranshipment) {
        this.expansionHeight = rowExpansion - heightTranshipment;
        heightTranshipment =
          heightTranshipment + (rowExpansion - heightTranshipment);
      } else {
        this.expansionHeight = 0;
      }
      const originTblHeight = originServices.length * 48;
      let destinationTblHeight = destinationServices.length * 48 + 63;
      const destinationStart = heightTranshipment + originTblHeight + 63;

      if (
        this.selectedCountries.origin.countryName ===
          this.selectedCountries.destination.countryName &&
        this.transhipmentCount.length === 0
      ) {
        heightTranshipment = 0;
        destinationTblHeight = 0;
      }
      const canvasHeight =
        heightTranshipment + originTblHeight + destinationTblHeight;

      this.totalCanvasHeight = canvasHeight;
      const serviceLength =
        this.services && this.services.length ? this.services.length : 0;
      this.routemap.nativeElement.width = serviceLength * 31;
      this.routemap.nativeElement.height = canvasHeight;

      let singleCountry =
        this.selectedCountries.destination.countryName ===
        this.selectedCountries.origin.countryName
          ? true
          : false;
      singleCountry = this.isSameOriginDestinationCountry;
      const transshipmentLength =
        transhipments && transhipments.length ? transhipments.length : 0;
      this.ctx = this.routemap.nativeElement.getContext('2d');
      let startY = 0;
      originServices.forEach((_origin, index) => {
        let startX = 23;
        for (const service of originServices[index]['services']) {
          if (service.route) {
            const isStartRoute = !service.previous && service.route;
            const startYPos = isStartRoute ? startY + 20 : startY;
            if (isStartRoute) {
              this.ctx.beginPath();
              this.ctx.lineWidth = 1;
              this.ctx.moveTo(startX + 5, startYPos);
              this.ctx.arc(startX, startYPos, 5, 0, Math.PI * 2, true);
              this.ctx.strokeStyle = 'black';
              this.ctx.stroke();

              if (!singleCountry) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 5;
                this.ctx.moveTo(startX, startYPos + 5);
                this.ctx.lineTo(startX, startY + 48);
                this.ctx.strokeStyle = this.getStrokeStyle(
                  service.feeder,
                  service.serviceCode
                );
                this.ctx.stroke();
              } else {
                this.drawSingleCountry(
                  startX,
                  startYPos + 5,
                  startX,
                  startY + 48,
                  service,
                  transshipmentLength
                );
              }
            } else {
              this.ctx.beginPath();
              this.ctx.lineWidth = 5;
              this.ctx.moveTo(startX, startYPos);
              this.ctx.lineTo(startX, startY + 16);
              this.ctx.strokeStyle = this.getStrokeStyle(
                service.feeder,
                service.serviceCode
              );
              this.ctx.stroke();
              this.ctx.beginPath();
              this.ctx.lineWidth = 1;
              this.ctx.arc(startX, startY + 20, 5, 0, Math.PI * 2, true);
              this.ctx.strokeStyle = 'black';
              this.ctx.stroke();
              if (!singleCountry) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 5;
                this.ctx.moveTo(startX, startY + 25);
                this.ctx.lineTo(startX, startY + 48);
                this.ctx.strokeStyle = this.getStrokeStyle(
                  service.feeder,
                  service.serviceCode
                );
                this.ctx.stroke();
              } else {
                this.drawSingleCountry(
                  startX,
                  startY + 25,
                  startX,
                  startY + 48,
                  service,
                  transshipmentLength
                );
              }
            }
          } else {
            if (service.previous) {
              if (!singleCountry) {
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(startX, startY + 48);
                this.ctx.strokeStyle = this.getStrokeStyle(
                  service.feeder,
                  service.serviceCode
                );
                this.ctx.stroke();
              } else {
                this.drawSingleCountry(
                  startX,
                  startY,
                  startX,
                  startY + 48,
                  service,
                  transshipmentLength
                );
              }
            }
          }
          startX = startX + 25;
        }
        startY = startY + 48;
      });
      let initValue = 23;
      let dValue = startY + 50;

      // this.services.forEach((_service, index) => {
      const _trIndex = [];
      const trRectangles = [];

      const drawPorts = [];
      const sortedTrans = [...transhipments].sort(
        (a, b) => b.length - a.length
      );

      // tslint:disable-next-line: no-unused-expression
      sortedTrans &&
        sortedTrans.forEach(ports => {
          if (ports && ports.length) {
            for (const port of ports) {
              const mPorts =
                port['previousPort'].serviceCode +
                port['currentPort'].serviceCode;
              const fPortPair = drawPorts.findIndex(_in => _in === mPorts);

              const serviceIndex = this.services.findIndex(
                _service =>
                  _service['serviceCode'] === port['previousPort'].serviceCode
              );
              const destinationIndex = this.services.findIndex(
                _p => _p['serviceCode'] === port['currentPort'].serviceCode
              );
              if (fPortPair < 0) {
                drawPorts.push(mPorts);
                const toValue = destinationIndex - serviceIndex;
                const hasOriginServices = pServices.originService.findIndex(
                  code => code === port['previousPort'].serviceCode
                );

                // service has origin
                this.ctx.beginPath();
                this.ctx.lineWidth = 5;
                if (hasOriginServices >= 0) {
                  this.ctx.moveTo(initValue + serviceIndex * 25, startY);
                  this.ctx.lineTo(initValue + serviceIndex * 25, dValue);
                  this.ctx.lineTo(
                    initValue + serviceIndex * 25 + toValue * 25,
                    dValue
                  );
                } else {
                  const _fTrIndex = _trIndex.findIndex(
                    _v => _v._index === serviceIndex
                  );
                  if (_fTrIndex >= 0) {
                    const _yPosition = _trIndex[_fTrIndex].dY;
                    this.ctx.moveTo(initValue + serviceIndex * 25, _yPosition);
                    this.ctx.lineTo(initValue + serviceIndex * 25, dValue);
                    this.ctx.lineTo(
                      initValue + serviceIndex * 25 + toValue * 25,
                      dValue
                    );
                  } else {
                    this.ctx.moveTo(initValue + serviceIndex * 25, 20);
                    this.ctx.lineTo(initValue + serviceIndex * 25, dValue);
                    this.ctx.lineTo(
                      initValue + serviceIndex * 25 + toValue * 25,
                      dValue
                    );
                  }
                }

                this.ctx.strokeStyle = this.getStrokeStyle(
                  port['previousPort'].feeder,
                  port['previousPort'].serviceCode
                );
                this.ctx.stroke();

                const _dIndex = pServices.destinationService.findIndex(
                  code => code === port['currentPort'].serviceCode
                );
                if (_dIndex >= 0) {
                  this.ctx.beginPath();
                  this.ctx.lineWidth = 5;
                  this.ctx.moveTo(
                    initValue + serviceIndex * 25 + toValue * 25,
                    dValue
                  );
                  this.ctx.lineTo(
                    initValue + serviceIndex * 25 + toValue * 25,
                    destinationStart
                  );
                  this.ctx.strokeStyle = this.getStrokeStyle(
                    port['currentPort'].feeder,
                    port['currentPort'].serviceCode
                  );
                  this.ctx.stroke();
                } else {
                  // connect first and last bubbles
                  const _cTrIndex = _trIndex.findIndex(
                    _v => _v._index === destinationIndex
                  );
                  if (_cTrIndex >= 0) {
                    const _yPosition = _trIndex[_cTrIndex].dY;
                    this.ctx.beginPath();
                    this.ctx.lineWidth = 5;
                    this.ctx.moveTo(
                      initValue + serviceIndex * 25 + toValue * 25,
                      dValue
                    );
                    this.ctx.lineTo(
                      initValue + serviceIndex * 25 + toValue * 25,
                      _yPosition
                    );
                    this.ctx.strokeStyle = this.getStrokeStyle(
                      port['currentPort'].feeder,
                      port['currentPort'].serviceCode
                    );
                    this.ctx.stroke();
                  }
                }
                const rec = {
                  x: initValue + serviceIndex * 25 + toValue * 25 - 13,
                  y: dValue - 7
                };
                trRectangles.push(rec);

                const _findY = _trIndex.findIndex(
                  _v => _v._index === destinationIndex
                );

                if (_findY < 0) {
                  const _d = {
                    _index: destinationIndex,
                    dY: dValue
                  };
                  _trIndex.push(_d);
                }
                dValue = dValue + 30;
              }
            }
          }
        });

      // connect service to first transshipment for multi country search
      if (this.isSameOriginDestinationCountry) {
        for (const _value of _trIndex) {
          const service = this.services[_value._index];
          if (service) {
            const hasOriginServices = pServices.originService.findIndex(
              code => code === service['serviceCode']
            );
            if (hasOriginServices > 0) {
              this.ctx.beginPath();
              this.ctx.lineWidth = 5;
              this.ctx.moveTo(initValue + _value._index * 25, startY);
              this.ctx.lineTo(initValue + _value._index * 25, _value.dY);
              this.ctx.strokeStyle = this.getStrokeStyle(
                service['feeder'],
                service['serviceCode']
              );
              this.ctx.stroke();
            }
          }
        }
      }

      for (const cServiceCode of commonServices) {
        const cServiceIndex = this.services.findIndex(
          _service => _service['serviceCode'] === cServiceCode
        );
        const selectedCService = this.services[cServiceIndex];
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.moveTo(initValue + cServiceIndex * 25, startY);
        this.ctx.lineTo(initValue + cServiceIndex * 25, destinationStart);
        this.ctx.strokeStyle = this.getStrokeStyle(
          selectedCService['feeder'],
          cServiceCode
        );
        this.ctx.stroke();
      }

      let dStartY = destinationStart;

      destinationServices.forEach((_destination, index) => {
        let dStartX = 23;
        for (const service of _destination['services']) {
          if (service.route) {
            const isEnd = !service.next && service.route;
            const startYPos = dStartY;
            this.ctx.beginPath();
            this.ctx.lineWidth = 5;
            this.ctx.moveTo(dStartX, startYPos);
            this.ctx.lineTo(dStartX, dStartY + 16);
            this.ctx.strokeStyle = this.getStrokeStyle(
              service.feeder,
              service.serviceCode
            );
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.arc(dStartX, dStartY + 20, 5, 0, Math.PI * 2, true);
            this.ctx.strokeStyle = 'black';
            this.ctx.stroke();
            if (!isEnd) {
              this.ctx.beginPath();
              this.ctx.lineWidth = 5;
              this.ctx.moveTo(dStartX, dStartY + 25);
              this.ctx.lineTo(dStartX, dStartY + 48);
              this.ctx.strokeStyle = this.getStrokeStyle(
                service.feeder,
                service.serviceCode
              );
              this.ctx.stroke();
            }
          } else {
            if (service.next) {
              this.ctx.beginPath();
              this.ctx.lineWidth = 5;
              this.ctx.moveTo(dStartX, dStartY);
              this.ctx.lineTo(dStartX, dStartY + 48);
              this.ctx.strokeStyle = this.getStrokeStyle(
                service.feeder,
                service.serviceCode
              );
              this.ctx.stroke();
            }
          }
          dStartX = dStartX + 25;
        }
        dStartY = dStartY + 48;
      });

      for (const rect of trRectangles) {
        this.roundRect(this.ctx, rect.x, rect.y, 27, 14, 8, true, true);
      }
    }, 2000);
  }

  public drawSingleCountry(x1, y1, x2, y2, service, transshipmentLength): void {
    if (transshipmentLength > 0) {
      const serviceInclude = this.transshipmentServices.includes(
        service.serviceCode
      );
      if (serviceInclude) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.getStrokeStyle(
          service.feeder,
          service.serviceCode
        );
        this.ctx.stroke();
      } else {
        if (service.next) {
          this.ctx.beginPath();
          this.ctx.lineWidth = 5;
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.strokeStyle = this.getStrokeStyle(
            service.feeder,
            service.serviceCode
          );
          this.ctx.stroke();
        }
      }
    } else {
      if (service.next) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.getStrokeStyle(
          service.feeder,
          service.serviceCode
        );
        this.ctx.stroke();
      }
    }
  }

  public roundRect(ctx, x, y, width, height, radius, fill?: any, stroke?: any) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = '#6d7278';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private generatePDFForSelectedResults(psize) {
    this.loaderService.show('progress');

    const routeImage = this.routemap.nativeElement.toDataURL('image/png');
    const cWidth = this.routemap.nativeElement.width;
    const instance: MatDialogRef<ExportToPdfComponent> = this.dialog.open(
      ExportToPdfComponent,
      {
        panelClass: 'full-screen-modal',
        data: {
          originData: this.originData,
          pSize: psize,
          selectedCountries: this.selectedCountries,
          image: routeImage,
          expansionHeight: this.expansionHeight,
          canvasWidth: cWidth,
          transshipmentLength: this.transhipmentCount,
          qrCode: this.qrCode,
          services: this.services,
          hasFeederService: this.hasFeederService,
          customerView: this.customerView
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    return instance.componentInstance.innerHTML.pipe(takeUntil(this.destroy$));
  }

  public getQrCode() {
    this.dataService
      .getBlobData('/swire/qrcode/countrycode/AU')
      .subscribe(ss => {
        this.createImageFromBlob(ss);
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

  public downloadPdf() {
    const pSize = [
      {
        width: 1123,
        height: 794,
        name: 'a4',
        column: 6,
        scale: 3
      },
      {
        width: 1588,
        height: 1123,
        name: 'a3',
        column: 9,
        scale: 2
      },
      {
        width: 2246,
        height: 1588,
        name: 'a2',
        column: 13,
        scale: 1.5
      },
      {
        width: 3179,
        height: 2246,
        name: 'a1',
        column: 19,
        scale: 1
      },
      {
        width: 4494,
        height: 3179,
        name: 'a0',
        column: 25,
        scale: 1
      }
    ];

    const max = [];
    for (const p of pSize) {
      if (this.totalCanvasHeight + 390 < p.height) {
        max.push(p);
      }
    }
    const selectedSize = max[0];

    this.generatePDFForSelectedResults(selectedSize).subscribe(async s => {
      if (!s) {
        return;
      }
      const fileName =
        this.selectedCountries.origin.countryCode +
        '-' +
        this.selectedCountries.destination.countryCode;
      const pdf = await this.exportPdf.exportHTMLToPDF(
        selectedSize,
        s,
        this.loaderService
      );
      filesaver.saveAs(new Blob([pdf], { type: 'application/pdf' }), fileName);
      this.loaderService.hide();
    });
  }
  public getStrokeStyle(feeder: any, code: any): any {
    let color;
    const colors = {
      TRT: '#ff8c00',
      APA: '#2e8b57',
      CHA: '#ff0000',
      ESEA: '#DC3398',
      ETS: '#ffd700',
      GSX: '#808000',
      NATS: '#0000ff',
      NAX: '#800000',
      NGS: '#87cefa',
      NZAP: '#1e90ff',
      NZPI: '#00008b',
      PAC: '#ff00ff',
      PIS: '#7cfc00',
      PLY: '#C92C2C',
      PNA: '#ba55d3',
      PNG: '#00DCCF',
      NWD: '#404b69'
    };

    if (feeder) {
      color = 'gray';
    } else {
      if(code) {
      color = colors[code];
      } else {
        color = 'gray';
      }
      
    }
    return color;
  }
  navigateBack(url: string) {
    this.router.navigate([url]);
  }
  public filterDateRange(results: any[]): any[] {
    if (this.selectedStartDate != null && this.selectedEndDate != null) {
      results = results.map(r => {
        const originCountry = r.originCountry.filter(f => {
          if (
            this.selectedStartDate <= f['arrDate'] &&
            this.selectedEndDate >= f['depDate']
          ) {
            return true;
          } else {
            return false;
          }
        });

        const destinationCountry = r.destinationCountry.filter(f => {
          if (
            this.selectedStartDate <= f['arrDate'] &&
            this.selectedEndDate >= f['depDate']
          ) {
            return true;
          } else {
            return false;
          }
        });
        //  .filter(f => f);
        return { ...r, originCountry, destinationCountry };
      });
    }
    return results;
  }
  public filter() {
    let results = [...this.originalCopy];

    results = this.filterDateRange(results);

    results = this.filterColumns(this.deselectedUniqueVesselsList, results);

    results = this.filterServices(this.selectedServices, results);

    results = this.filterPorts(this.selectedPort, results);

    results = this.filterTranshipmentPorts(
      this.selectedTranshipmentPorts,
      results
    );
    results = this.filterTranshipmentCounts(
      this.selectedTranshipmentCount,
      results
    );
    results = this.filterTranshipmentDuration(this.selectedRange, results);
    this.processData(results);

    //  this.tickColumns(this.tempDeselectedUniqueVesselsList);
  }
  public filterColumns(deselectedUniqueVesselsList: any[], results) {
    if (deselectedUniqueVesselsList.length === 0) {
      return results;
    }
    results = results.filter(r => {
      // iterator the list of deselectedUniqueVesselsList with current results uniqueVessels.
      // if the list is same as before, this particular r is not to be filtered.
      const temp = deselectedUniqueVesselsList.filter(d =>
        this.filterHelperForUniqueVessels(d, r.uniqueVessels)
      );
      return temp.length === deselectedUniqueVesselsList.length;
    });

    return results;
  }
  public tickColumns(deselectedUniqueVesselsList: any[]) {
    if (deselectedUniqueVesselsList.length === 0) {
      //   return results;
    }
    this.originData.vessels = [
      ...this.originData.vessels.map(v => {
        // if the list is same as before, this particular r is not to be filtered.
        const isKept = deselectedUniqueVesselsList.filter(d =>
          this.filterHelperForUniqueVessels(d, v.uniqueVessels)
        );
        if (isKept.length !== deselectedUniqueVesselsList.length) {
          v = { ...v, hideColumn: true };
        }
        return v;
      })
    ];
  }

  public filterTranshipmentDuration(counts, results) {
    results = results.filter(r => {
      const v = r.totalTranshipmentDuration;
      if (v >= counts.minValue && v <= counts.maxValue) {
        return true;
      } else {
        return false;
      }
    });
    return results;
  }
  public filterTranshipmentCounts(counts, results): any {
    results = results.filter(r => {
      if (r.transhipments && r.transhipments.length > 0) {
        return counts.indexOf(r.transhipments.length + '') > -1;
      } else {
        return counts.indexOf('0') > -1;
      }
    });

    return results;
  }
  public filterTranshipmentPorts(selectedTranshipmentsPorts, results): any {
    // filter results such that all transhipment ports are within selected transhipment ports
    results = results.filter(r => {
      // perform this logic only if transhipment is present.
      if (r.transhipments && r.transhipments.length > 0) {
        return !(
          /** If you find any port which is outside of selected transhipment ports, remove that product */
          (
            r.transhipments.findIndex(
              t =>
                /** check if any port is outside of selected transhipment ports. */
                selectedTranshipmentsPorts.indexOf(t.currentPort.portCode) ===
                -1
            ) > -1
          )
        );
      } else {
        return true;
      }
    });
    return results;
  }
  public filterServices(selectedSerices: any[], results) {
    // let results = [...this.originalCopy];
    /*if (selectedSerices.length > 0)*/ {
      results = results.map(r => {
        let newObject = {} as any;
        let originCountry = r.originCountry;
        let destinationCountry = r.destinationCountry;
        if (r.transhipments.length === 0) {
          originCountry = r.originCountry.filter(oc => {
            // if (oc.feeder) {
            // return selectedSerices.indexOf('feeder') > -1;
            //} else {
            return selectedSerices.indexOf(oc.serviceCode) > -1;
            //}
          });
          destinationCountry = r.destinationCountry.filter(dc => {
            //if (dc.feeder) {
            // return selectedSerices.indexOf('feeder') > -1;
            //} else {
            return selectedSerices.indexOf(dc.serviceCode) > -1;
            //}
          });
        } else {
          const filteredTranshipments = r.transhipments.filter(t => {
            const currentPort = t.currentPort;
            const previousPort = t.previousPort;
            let isPresent = false;
            //if (currentPort.feeder) {
            // isPresent = selectedSerices.indexOf('feeder') > -1;
            //} else {
            isPresent = selectedSerices.indexOf(currentPort.serviceCode) > -1;
            //}
            if (!isPresent) {
              return false; // since this port is filtered out, we cant have the product
            }
            //if (previousPort.feeder) {
            //isPresent = selectedSerices.indexOf('feeder') > -1;
            //} else {
            isPresent = selectedSerices.indexOf(previousPort.serviceCode) > -1;
            //}
            return isPresent;
          });
          if (filteredTranshipments.length !== r.transhipments.length) {
            originCountry = [];
            destinationCountry = [];
          }
        }
        newObject = { ...r, origin, originCountry, destinationCountry };
        return newObject;
      });
      if (this.isSameOriginDestinationCountry) {
        results = results.filter(r => r.originCountry.length > 0);
      } else {
        results = results.filter(
          r => r.originCountry.length > 0 && r.destinationCountry.length > 0
        );
      }
    }
    // this.processData(results);
    return results;
  }
  private reduceValues = type => {
    if (type === 'countryCode') {
      return (previousValue, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 0) {
          return previousValue + '-' + currentValue;
        }
        return previousValue;
      };
    } else if (type === 'countryName') {
      return (previousValue, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 1) {
          return previousValue + '-' + currentValue;
        }
        return previousValue;
      };
    }
  };

  public toggle(event) {
    this.isEditEnabled = !this.isEditEnabled;
    this.customerView = this.isEditEnabled;
  }
  public rangeChange(event) {}
  /**
   *
   * @param flag
   * @param uniqueVessels
   *
   * In this function, we add/remove the uniqueVessels (which uniquely identiy each column of
   *  schedule builder.) to the list of deselectedUniqueVesselsList
   *
   * If the flag is true .i.e column is selected, we remove the uniqueVessels else we add it.
   *
   * Add is straight forward, we directly add it.
   * For removing, we need to iterate (filter) the exisitng deselectedUniqueVesselsList
   * to identify the passed uniqueVessels and remove it.
   */
  public setdeselectedUniqueVessels(flag: boolean, uniqueVessels: any[]) {
    setTimeout(() => {
      if (!flag) {
        // deselectedUniqueVesselsList - List of List
        this.tempDeselectedUniqueVesselsList = this.tempDeselectedUniqueVesselsList.filter(
          (deselectedUniqueVessels: any[]) =>
            this.filterHelperForUniqueVessels(
              deselectedUniqueVessels,
              uniqueVessels
            )
        );
      } else {
        this.tempDeselectedUniqueVesselsList.push(uniqueVessels);
      }
      // this.filter();
    }, 1);
  }

  private filterHelperForUniqueVessels(
    deselectedUniqueVessels: any[],
    uniqueVessels: any[]
  ): boolean {
    // deselectedUniqueVessels - individual List

    /**
     * if the lenght of passed argument is equal to this item of the list, then
     * we can go ahead with further comparision
     */
    if (deselectedUniqueVessels.length === uniqueVessels.length) {
      /** We filter the individual list by checiking each item of the list, whether
       * it is present in the passed argumnet. If its present, we include it in TEMP.
       */
      const temp = deselectedUniqueVessels.filter(
        // deUniqueVessels individual element on the list
        deUniqueVessels =>
          uniqueVessels.findIndex(
            f =>
              f['pf_bound'] === deUniqueVessels['pf_bound'] &&
              f['service_code'] === deUniqueVessels['service_code'] &&
              f['vessel_code'] === deUniqueVessels['vessel_code'] &&
              f['voyage_number'] === deUniqueVessels['voyage_number']
          ) > -1
      );
      /** If the lengths are same that means we have found the argument in our list and we remove it.
       *  If the lengths are not same,we keep it
       */
      return temp.length !== deselectedUniqueVessels.length;
    } else {
      /** else we don't filter it out. We include it in our new result. */
      return true;
    }
  }

  /* display error popup
   ** navigate back to landing page of schedue builder
   ** when click on ok button.
   **/
  public displayErrorPopup(data: any): void {
    if (data?.length) {
      return;
    }
    let message = AppMessages.SCHEDULE_NO_RESULT;
    if (data.status) {
      try {
        let isDateIusse = data.error.status == 'dateRangeIssue';
        message = isDateIusse
          ? AppMessages.DATE_RANGE_TOO_NARROW
          : AppMessages.SERVICE_ERROR;
      } catch (e) {
        message = AppMessages.SERVICE_ERROR;
      }
    }
    const dialogRef: MatDialogRef<AlertMessageComponent> = this.dialog.open(
      AlertMessageComponent,
      {
        width: '476px',
        data: {
          message
        },
        disableClose: true,
        backdropClass: 'backdropBackground',
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result === AppConstants.OK) {
        this.navigateBack('/schedule-builder');
      }
    });
  }

  public displayScrollBar(event) {
    this.hideScroll = false;
  }
  public hideScrollBar(event) {
    this.hideScroll = true;
  }

  public setScrollDiv() {
    let elmnt = document.getElementById('mat-tbl-id');
    setTimeout(() => {
      if (elmnt) {
        let rect = elmnt?.getBoundingClientRect();
        let pElm = document.getElementById('mt-scroll');
        // pElm.style.left =  rect.left + 'px';

        let stElmnt = document.getElementById('scroll-ch');
        pElm.style.width = elmnt?.offsetWidth + 'px';
        stElmnt.style.width = elmnt?.scrollWidth + 'px';
      }
    }, 2000);
  }

  ngAfterViewInit(): void {
    const content = document.getElementById('mt-scroll');
    const scroll$ = fromEvent(content, 'scroll').pipe(map(() => content));

    scroll$.subscribe(element => {
      let elmnt = document.getElementById('mat-tbl-id');
      elmnt.scrollLeft = content.scrollLeft;
    });
  }
  public onClick() {
    // nothing is selected.
    //   if (this.tempDeselectedUniqueVesselsList.length == 0) {
    // and checkboxes are  hidden

    if (!this.showCheckboxes) {
      this.showCheckboxes = true;
      this.showHideButtonText = 'Hide selected products';
      return;
    } else {
      this.showCheckboxes = false;
      this.showHideButtonText = 'Show/Hide products';
      this.deselectedUniqueVesselsList = this.tempDeselectedUniqueVesselsList;
      this.filter();
      if (this.tempDeselectedUniqueVesselsList.length > 0) {
        this.showRestore = true;
      } else {
        this.showRestore = false;
      }
    }
    // }
    // something is selected
    /* else {
      // if the checkboxes are shown, this means, filter out selected once.
      if (this.showCheckboxes) {
        this.deselectedUniqueVesselsList = this.tempDeselectedUniqueVesselsList;
        this.filter();
        // this.tempDeselectedUniqueVesselsList = [];
        this.showCheckboxes = false;
        this.showHideButtonText = 'Restore cols';
      } // if checkboxes are not shown, it means we need to remove filter and show checkboxes
      else {
        this.showCheckboxes = true;
        this.deselectedUniqueVesselsList = [];
        this.filter();
        this.showHideButtonText = 'Hide selected cols';
      }
    }*/
  }
  public restoreCols(): void {
    this.deselectedUniqueVesselsList = [];
    this.filter();
    this.tickColumns(this.tempDeselectedUniqueVesselsList);
    this.showCheckboxes = true;
  }
  public dateChange($event) {}
  public showPicker() {
    setTimeout(() => {
      if (!this.selectedEndDate) {
        alert('Please select end date for the range');
        this.picker.open();
      }
    }, 10);
  }
}
