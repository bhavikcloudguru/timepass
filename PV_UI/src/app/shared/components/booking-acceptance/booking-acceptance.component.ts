import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/data.service';

import { Utils } from 'src/app/common/utilities/Utils';
import { Booking } from '../../models/Booking';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AutocompleteFlagComponent } from '../autocomplete-flag/autocomplete-flag.component';
import { DateAdapter } from '@angular/material/core';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-booking-acceptance',
  templateUrl: './booking-acceptance.component.html',
  styleUrls: ['./booking-acceptance.component.scss']
})
export class BookingAcceptanceComponent implements OnInit, OnDestroy {
  public booking = new Booking();
  public bookingId = '';
  public cargoDetails: any;
  private fileIndex = 0;
  public showLoader = false;
  public ports;
  public bookingForm;
  private subscriptionArray: Subscription[] = [];
  public _searchFormData: any = {};
  public nextPods: any[] = [];
  public onSubmitBooking = false;
  @ViewChild('originPort', { read: AutocompleteFlagComponent })
  originPort: AutocompleteFlagComponent;
  @ViewChild('destinationPort', { read: AutocompleteFlagComponent })
  destinationPort: AutocompleteFlagComponent;
  @ViewChild('dischargePort', { read: AutocompleteFlagComponent })
  dischargePort: AutocompleteFlagComponent;
  public stateGroups;
  public polData;
  public files: File[] = [];
  public addHaz: {
    imoClasID: string;
    imoClassCode: string;
    imoClassDesc: string;
  }[] = [
    {
      imoClasID: 'Non Haz',
      imoClassCode: 'Non Haz',
      imoClassDesc: 'Non Haz'
    },
    {
      imoClasID: 'Mixed DG',
      imoClassCode: 'Mixed DG',
      imoClassDesc: 'Mixed DG'
    }
  ];
  public oogContainers = ['20OT', '40OT', '20FR', '40FR'];
  constructor(
    private dialogRef: MatDialogRef<BookingAcceptanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService,
    private dateAdapter: DateAdapter<Date>,
    public storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.booking.pol = this.data.portCode;

    this.bookingForm = new FormGroup({
      originPort: new FormControl(''),
      destinationPort: new FormControl(''),
      dischargePort: new FormControl('')
    });

    if (!(this.data.details && this.data.details.bookingId)) {
      this.booking.insertCargo();
    }

    this.setEmailId();
    this.getServiceDetails();
    this.setFormValueSubscriptions();
    this.booking.departureDate = this.data.departureDate;

    /* this.booking.portCode = this.data.portCode;
    this.booking.departureDate = this.data.departureDate;
    const portList = this.booking.uniquePortList(this.data.portList);



    this.setFormValues(this.data.details);
    this.booking.setData(
      this.data.details,
      portList,
      this.data.pod,
      this.data.details.bookingId
    );
    this.setEmailId();
    this.showLoader = true;
    this.dataService.getCargoDetails().subscribe(
      result => {
        this.cargoDetails = result;
        this.showLoader = false;
      },
      error => {}
    );


    this.setFormValueSubscriptions(); */
  }

  public getServiceDetails() {
    this.showLoader = true;
    this.dataService.getCargoDetails().subscribe(
      result => {
        this.cargoDetails = result;
        if (this.cargoDetails.hazDatalake) {
          this.cargoDetails.hazDatalake = this.addHaz.concat(
            this.cargoDetails.hazDatalake
          );
        }

        const portList = this.booking.uniquePortList(this.data.portList);
        this.booking.setData(
          this.data.details,
          portList,
          result.equipment,
          this.oogContainers
        );
        this.getTotalWeight();
        this.showLoader = false;
      },
      error => {}
    );

    let fromdate = new Date();
    let todate = new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000);
    let fromDateParam = this.dateAdapter.format(fromdate, 'input');
    let toDateParam = this.dateAdapter.format(todate, 'input');
    let voyageNumber = this.data?.details?.voyageNumber;
    const splitVoyage = [
      this.data.details.bookingId
        ? voyageNumber
        : voyageNumber?.slice(0, voyageNumber.length - 1),
      this.data.details.bookingId
        ? this.data?.details?.direction
        : voyageNumber?.slice(voyageNumber.length - 1)
    ];
    const portInfo = {
      portcode: this.data.portCode,
      fromdate: fromDateParam,
      todate: toDateParam,
      vesselcode: this.data.details.vesselCode,
      servicecode: this?.data?.details?.serviceCode
        ? this?.data?.details?.serviceCode
        : '',
      voyageCode: splitVoyage[0],
      bound: splitVoyage[1]
    };

    this.dataService.getPortListForScheduleSearch().subscribe(response => {
      if (response && response.length) {
        this.ports = response;
        this.polData = this.getPortDetails(this.booking.pol);
        this.setForgroupValues();
        this.setNextPods(portInfo);
      }
    });
  }

  public selectItem(event, index) {
    //this.booking.cargoDetails[index].cargoType = event?.option?.value;
    if (event?.option?.value?.label === 'Break bulk') {
      this.booking.cargoDetails[index].bulk = true;
      this.booking.cargoDetails[index].container = false;
    } else {
      this.booking.cargoDetails[
        index
      ].oogVisibility = this.oogContainers.includes(
        event?.option?.value?.label
      );
      this.booking.cargoDetails[index].container = true;
      this.booking.cargoDetails[index].bulk = false;
    }
  }

  public addCargoType(): void {
    this.booking.insertCargo();
  }
  public deleteCargoType(event, index) {
    if (this.booking.cargoDetails.length > 1) {
      this.booking.deleteCargoType(index);
      this.getTotalWeight();
    }
  }

  public setForgroupValues() {
    setTimeout(() => {
      let originPort = this.ports.find(
        _p => _p.portCode === this.data?.details?.originPort
      );
      let destinationPort = this.ports.find(
        _p => _p.portCode === this.data?.details?.destinationPort
      );

      let dischargePort = this.nextPods.find(
        _p => _p.portCode === this.data?.details?.pod
      );
      if (this.data?.details?.originPort) {
        this.originPort.autocompleteFlagForm.controls[
          'autocompleteInput'
        ].setValue(originPort);
      }
      if (this.data?.details?.destinationPort) {
        this.destinationPort.autocompleteFlagForm.controls[
          'autocompleteInput'
        ].setValue(destinationPort);
      }
      if (this.data?.details?.pod && dischargePort) {
        this.dischargePort.autocompleteFlagForm.controls[
          'autocompleteInput'
        ].setValue(dischargePort);
      }
    }, 1000);
  }

  public setNextPods(portInfo): void {
    this.dataService.getNextPodDetails(portInfo).subscribe(
      result => {
        let nextpod = result.data;
        let filteredPods = this.ports.filter(item => {
          return nextpod.find(pod => item.portCode === pod.portCode);
        });
        this.nextPods = filteredPods;
        this.setForgroupValues();
      },
      error => {}
    );
  }

  public ngOnDestroy() {
    while (this.subscriptionArray.length > 0) {
      this.subscriptionArray.pop().unsubscribe();
    }
  }
  public setFormValueSubscriptions(): void {
    this._searchFormData = {
      originPort: '',
      destinationPort: '',
      dischargePort: ''
    };
    this.subscriptionArray = [];
    const key1 = 'originPort';
    const key2 = 'destinationPort';
    const key3 = 'dischargePort';
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.subscriptionArray.push(
        this.bookingForm.controls[key].valueChanges
          .pipe(
            distinctUntilChanged((x, y) => {
              if (key === key1 || key === key2 || key === key3) {
                return this.portComparator(x, y);
              } else {
                return x === y;
              }
            })
          )
          .subscribe(s => {
            const obj = {};
            obj[key] = s;
            this._searchFormData[key] = s;
            this.bookingForm.setValue(this._searchFormData);
          })
      );
    });
  }

  public setEmailId(): void {
    const userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userClaims && userClaims.email) {
      this.booking.fromEmail = userClaims.email;
    }
  }

  public validatePort(port, type) {
    this.originPort.autocompleteFlagForm.controls[
      'autocompleteInput'
    ].setValidators(null);
    this.destinationPort.autocompleteFlagForm.controls[
      'autocompleteInput'
    ].setValidators(null);
    if (type === 'dischargePort') {
      setTimeout(() => {
        if (this._searchFormData?.dischargePort) {
          this.dischargePort.errorState = false;
        } else {
          this.dischargePort.errorState = true;
        }
      }, 100);
    }
    /*  this.dischargePort.autocompleteFlagForm.controls[
       'autocompleteInput'
     ].setValidators(null); */
  }

  onSubmit() {
    this.booking.originPort = this._searchFormData?.originPort?.portCode;
    this.booking.destinationPort = this._searchFormData?.destinationPort?.portCode;
    this.booking.pod = this._searchFormData?.dischargePort?.portCode;
    let files = [];
    for (const item of this.booking.cargoDetails) {
      // if (item.bulk) { // now even containers have attachments
      files = files.concat(item.files);
      //}
    }

    console.log(this.booking.toJson());

    const promises = this.storageService.uploadFiles(files);
    console.log(promises);

    const formdata = new FormData();
    formdata.append(
      'capacityManagerEmailRequest',
      new Blob([JSON.stringify(this.booking.toJson())], {
        type: 'application/json'
      })
    );
    if (promises.length) {
      Promise.all(promises).then(fileContents => {
        fileContents.forEach((fileContent, index) => {
          formdata.append(
            'files',
            new Blob([fileContent], {
              type: files[index].type
            }),
            files[index].name
          );
        });
        this.submitData(formdata);
      });
    } else {
      this.submitData(formdata);
    }
  }

  public submitData(formdata): void {
    console.log('....submitData.......', formdata);
    this.showLoader = true;
    this.onSubmitBooking = true;
    this.dataService.postEmailServiceData(formdata).subscribe(result => {
      this.showLoader = false;
      if (result.isError) {
        setTimeout(() => {
          alert(
            'Something went wrong while submitting the booking. Please try again'
          );
        }, 10);
      } else {
        this.bookingId = result.bookingId;
      }
    });
  }

  public cancelPopup(): void {
    this.dialogRef.close();
  }

  public selectChange(): void {
    setTimeout(() => document.getElementById('shipper').focus());
  }

  public getTotalVolume(index) {
    setTimeout(() => {
      if (
        this.booking.cargoDetails[index].dimensions.width &&
        this.booking.cargoDetails[index].dimensions.height &&
        this.booking.cargoDetails[index].dimensions
      ) {
        const width =
          Number(this.booking.cargoDetails[index].dimensions.width) >= 0
            ? Number(this.booking.cargoDetails[index].dimensions.width)
            : 0;
        const height =
          Number(this.booking.cargoDetails[index].dimensions.height) >= 0
            ? Number(this.booking.cargoDetails[index].dimensions.height)
            : 0;
        const length =
          Number(this.booking.cargoDetails[index].dimensions.length) >= 0
            ? Number(this.booking.cargoDetails[index].dimensions.length)
            : 0;
        const value = width * height * length;
        this.booking.cargoDetails[index].volume = value;
      }
    }, 100);
  }

  private portComparator(x: any, y: any): boolean {
    if (x && y && !x.portCode && !y.portCode) {
      return x === y;
    }
    if (x && y && x.portCode && y.portCode) {
      return x.portCode === y.portCode;
    }
    if (!x && !y) {
      return true;
    }
    return false;
  }

  public getPortDetails(pol): any {
    const details = this.ports.find(item => item.portCode === pol);
    return details;
  }

  public showOptionName(option) {
    if (!option) return;
    return option.label + '-' + option.description;
  }

  public onSelect(event, index) {
    console.log('event', event.addedFiles);
    let totalSize = 0;
    const existingFileNames = this.booking.cargoDetails
      .flatMap(c => c.files)
      .map(f => f.name);
    const newlyAddedFileNames = event.addedFiles.map(item => item.name);
    const duplicateFiles = existingFileNames.filter(
      e => newlyAddedFileNames.indexOf(e) !== -1
    );

    if (duplicateFiles.length > 0) {
      alert('Duplicate files added -' + duplicateFiles);
    }
    const uniqFiles = event.addedFiles.filter(
      f => duplicateFiles.indexOf(f.name) === -1
    );

    for (const cargo of this.booking.cargoDetails) {
      const sum = cargo.files
        .map(item => item.size)
        .reduce((prev, curr) => prev + curr, 0);
      totalSize = totalSize + sum;
    }

    let currentFileSize = uniqFiles
      .map(item => item.size)
      .reduce((prev, curr) => prev + curr, 0);
    totalSize = totalSize + currentFileSize;
    let totalFiles =
      this.booking.cargoDetails[index].files.length + uniqFiles.length;
    if (totalFiles > 5) {
      alert('Not allowed more than 5 files');
      return;
    }
    if (totalSize >= 10000000) {
      alert(
        'Total file size exceeded maximum allowed limit. Please try again!'
      );
      return;
    }
    this.booking.cargoDetails[index].files.push(...uniqFiles);
  }

  public onRemove(event, index) {
    let files = this.booking.cargoDetails[index].files;
    files.splice(files.indexOf(event), 1);
  }

  public customTrackBy(index: number, obj: any) {
    return index;
  }
  public getTotalWeight() {
    setTimeout(() => {
      this.booking.totalWeight = 0;
      this.booking.cargoDetails.forEach(item => {
        if (item && item.totalWeight >= 0) {
          this.booking.totalWeight += Number(item.totalWeight);
        }
      });
    }, 300);
  }
}
