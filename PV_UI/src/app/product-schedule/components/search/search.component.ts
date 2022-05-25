import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  EventEmitter,
  Output,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { OriginDestination } from '../../models/OriginDestinationDTO';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

import { startWith, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SliderComponent } from '../slider/slider.component';
import { AutocompleteFlagComponent } from 'src/app/shared/components/autocomplete-flag/autocomplete-flag.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
/** This is a dumb component. It takes in data and shows it on UI. (limited validations) */
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly originGroup = [
    'invalidOriginPort',
    'invalidFlexibiliytValue',
    'invalidDepartureDate',
    'emptyOriginPort'
  ];
  private readonly destinationGroup = [
    'invalidDestinationPort',
    'invalidArrivalDate',
    'isSameOriginDestination',
    'emptyDestinationPort'
  ];
  /** one day is 1000 milliseconds * 60 seconds * 60 minutes * 24 hours */
  private readonly oneDay = 24 * 60 * 60 * 1000;
  /**
   * subscriptionArray : used for pushing all the subscribed values to this
   * particular array so that finally we can unsubscribe using ngDestroy()
   */
  private subscriptionArray: Subscription[] = [];
  // we can give this field as input to autofocus on autocomplate fields
  @Input() autoFocusOriginField: boolean;
  // this will be used as the complete list of ports
  @Input() public portList: OriginDestination[];
  // send input to slidercomponent. YOu can have another variable if you need to
  // send different values to the 2 slider components we have.
  @Input() sliderMinMaxData;
  // @Input() public startAt;
  @Input() public minDate;
  @Output() srchButtonClicked = new EventEmitter();
  // FormGroup of the form fields we have.
  public searchForm: FormGroup;
  private isArrivalDateOpen: boolean;
  isCo2Readonly: boolean = true;
  // Validations should be a part of the formControl
  // This @Input will make sure form data comes from the root component
  @Input() public set searchFormData(_searchFormData) {
    if (!this.searchForm) {
      this.initSearchForm(_searchFormData);
    }
    // we set the value which comes from root component
    this.searchForm.setValue(_searchFormData);
    this._searchFormData = _searchFormData;
  }
  private _showLoading: boolean;
  @Input() public set showLoading(b: boolean) {
    this._showLoading = b;
  }
  public get showLoading(): boolean {
    return this._showLoading;
  }
  @Output() saveCo2 = new EventEmitter<any>();
  private _co2Credit;
  @Input() public set co2Credit(data) {
    this._co2Credit = data;
    if (this._co2Credit) {
      this.setCreditFormData();
    }
  }
  public get co2Credit(): any {
    return this._co2Credit;
  }

  @ViewChild('originPort', { read: AutocompleteFlagComponent })
  originPort: AutocompleteFlagComponent;
  @ViewChild('destinationPort', { read: AutocompleteFlagComponent })
  destinationPort: AutocompleteFlagComponent;
  @ViewChild('maxTrans', { read: SliderComponent })
  maxTrans: SliderComponent;
  @ViewChild('departureFlexibility', { read: SliderComponent })
  departureFlexibility: SliderComponent;
  // stores local copy of the data sent by the parent component
  private _searchFormData = {};
  /** This outputs the data updated in the searhFrom. It keeps in sync with the parent */
  @Output() updateSearchFormData = new EventEmitter();
  public arrivalMinDate;
  public disableSearch: boolean;
  public originGroupRelatedErrorMessages = [];
  public destinationGroupRelatedErrorMessages = [];
  disableArrival: boolean;
  public selectedOption = 'Tonne';
  public showDropDown = false;
  public co2form = new FormGroup({
    creditId: new FormControl(''),
    cost: new FormControl('', Validators.required),
    currency: new FormControl('USD', Validators.required),
    unit: new FormControl('Per 100 TON-CO2', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required)
  });
  public readonlyview = true;
  public focusinput = false;
  public creditUnits = ['per TON-CO2'];
  constructor() {}

  ngOnInit(): void {
    /** this event emitter will update the root component with data whenever anything is updated in
     * this component.
     */
    Object.keys(this.searchForm.controls).forEach(key => {
      this.subscriptionArray.push(
        this.searchForm.controls[key].valueChanges
          .pipe(
            distinctUntilChanged((x, y) => {
              if (key === 'originPort' || key === 'destinationPort') {
                return this.portComparator(x, y);
              } else {
                return x === y;
              }
            })
          )
          .subscribe(s => {
            const obj = {};
            obj[key] = s;
            this.updateSearchFormData.emit(obj);
            // enable search button on any change of the input.
            // further, validations will also decide whether or not the button should enable
            this.disableSearch = false;
          })
      );
    });

    // on changing departureDate we will get currently updated value for departureDate
    this.subscriptionArray.push(
      this.searchForm.controls.departureDate.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(deptData => {
          const c = this.searchForm.controls.departureDate;
          // do the validation
          const e = this.validateControls(c, deptData, 'invalidDepartureDate');
          if (!e) {
            // if we dont have error, remove errors on dep flexibility too.
            // Dep flexibility error can also be fixed by dep date change.
            this.setOrRemoveError(
              this.searchForm.controls.departureFlexibility,
              'invalidFlexibiliytValue',
              e
            );
            this.departureFlexibility &&
              (this.departureFlexibility.errorState = false);
          }
        })
    );
    this.subscriptionArray.push(
      this.searchForm.controls.arrivalDate.valueChanges
        .pipe(startWith(''), distinctUntilChanged())
        .subscribe(deptData => {
          const c = this.searchForm.controls.arrivalDate;
          // validate control
          const e = this.validateControls(c, deptData, 'invalidArrivalDate');
          if (!e) {
            // if no error, remove dep date and dep flexibility error too.
            // dep date/dep flexibility error can be removed by changing arrival date.
            this.setOrRemoveError(
              this.searchForm.controls.departureDate,
              'invalidDepartureDate',
              e
            );
            this.setOrRemoveError(
              this.searchForm.controls.departureFlexibility,
              'invalidFlexibiliytValue',
              e
            );
            this.departureFlexibility &&
              (this.departureFlexibility.errorState = false);
          }
        })
    );
    // on changing departureflex we will get currently updated value for departureflex
    this.subscriptionArray.push(
      this.searchForm.controls.departureFlexibility.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(deptFlexData => {
          const c = this.searchForm.controls.departureFlexibility;
          const e = this.validateControls(
            c,
            deptFlexData,
            'invalidFlexibiliytValue'
          );
          if (!e) {
            this.setOrRemoveError(
              this.searchForm.controls.departureDate,
              'invalidDepartureDate',
              e
            );
          }
          this.departureFlexibility &&
            (this.departureFlexibility.errorState = e ? true : false);
        })
    );

    // on changing originport we will get currently updated value for originport
    this.subscriptionArray.push(
      this.searchForm.controls.originPort.valueChanges
        .pipe(
          startWith(''),
          distinctUntilChanged((a, b) => this.portComparator(a, b))
        )
        .subscribe(originPortData => {
          let e = null;
          if (originPortData) {
            // check for same origin destination port error
            let e2 = this.isSameOriginDestination(
              originPortData,
              this._searchFormData['destinationPort'],
              'origin'
            );
            // Same origin destination port issue
            // assuming the user will not keep origin invalid and come to play with destination
            this.destinationPort.errorState = e2
              ? true
              : this.destinationPort.errorState;

            e2 = this.setOrRemoveError(
              this.searchForm.controls.originPort,
              'isSameOriginDestination',
              e2
            );
            e = this.validatePort('', 'origin');
            e = this.combine(e, e2);
            // finally set state or originport to error depending on error content
            this.originPort.errorState = e ? true : false;
          }
        })
    );

    // on changing destinationport we will get currently updated value for destinationPort
    this.subscriptionArray.push(
      this.searchForm.controls.destinationPort.valueChanges
        .pipe(
          startWith(''),
          distinctUntilChanged((a, b) => this.portComparator(a, b))
        )
        .subscribe(destPortData => {
          if (destPortData) {
            let e = null;
            // if (destPortData) {
            let e2 = this.isSameOriginDestination(
              this._searchFormData['originPort'],
              destPortData,
              'dest'
            );
            this.originPort.errorState = e2 ? true : this.originPort.errorState;

            e2 = this.setOrRemoveError(
              this.searchForm.controls.destinationPort,
              'isSameOriginDestination',
              e
            );

            e = this.validatePort('', 'dest');
            e = this.combine(e, e2);
            this.destinationPort.errorState = e ? true : false;
          }
        })
    );
  }

  public setCreditFormData() {
    if (this._co2Credit.length) {
      let co2credit = this._co2Credit[0];
      this.co2form = new FormGroup({
        creditId: new FormControl(co2credit.creditId),
        cost: new FormControl(co2credit.cost, Validators.required),
        currency: new FormControl(co2credit.currency, Validators.required),
        unit: new FormControl(co2credit.unit, Validators.required),
        startDate: new FormControl(co2credit.startDate, Validators.required),
        endDate: new FormControl(co2credit.endDate, Validators.required)
      });
    }
  }

  public saveCredits(): void {
    let co2Data = this.co2form.value;
    co2Data.startDate = formatDate(co2Data.startDate, 'yyyy-MM-dd', 'en-US');
    co2Data.endDate = formatDate(co2Data.endDate, 'yyyy-MM-dd', 'en-US');
    this.saveCo2.emit(co2Data);
    this.readonlyview = true;
  }

  /** this method is used to carry out custom validation and set error fields on respective form control */
  validateControls(control: AbstractControl, value, validatorKey: string): any {
    /** do field validation w.r.t to the function name passed as @validatorKey and current
     * value passed as @values
     */
    let errors = this[validatorKey](value);
    /** If no errors returned from the validation, it means current value is valid.
     *  Remove the error from field control.
     *  While removing the error, make sure you remove error only of the validatorKey type and
     *  not others. It may so happen that a control can have multiple errors
     *  and only one is fixed.
     */
    errors = this.setOrRemoveError(control, validatorKey, errors);
    return errors;
  }
  private setOrRemoveError(control, validatorKey, errors) {
    const obj = {};
    /** If no errors returned from the validation, it means current value is valid.
     *  Remove the ONLY validatorKey error from field control.
     */
    if (!errors) {
      /** If the control field already has some error, maintain those errors while removing the
       * current one.
       */
      if (control.errors) {
        errors = { ...control.errors };
        if (control.getError(validatorKey)) {
          delete errors[validatorKey];
        }
      }
      // Remove the message too...
      obj[validatorKey] = '';
    } else {
      /** we got errors from validation and also the control has existing errors.
       * Combine the 2 and set the combined error to the control
       */
      if (control.errors) {
        errors = { ...control.errors, ...errors };
      }
      // add message
      obj[validatorKey] = errorMessages[validatorKey];
    }

    /**
     * If error is to be shown in the origin group, check here else it'll be in dest group
     */
    if (this.originGroup.indexOf(validatorKey) > -1) {
      this.originGroupRelatedErrorMessages = {
        ...this.originGroupRelatedErrorMessages,
        ...obj
      };
    } else {
      // delete this.destinationGroupRelatedErrorMessages[validatorKey];
      this.destinationGroupRelatedErrorMessages = {
        ...this.destinationGroupRelatedErrorMessages,
        ...obj
      };
    }
    errors =
      // empty object check- if empty replace with null.
      this.isEmpty(errors) ? null : errors;
    // the below annonymous function sets the errors in setTimout to fire angular change detection
    ((ctrl, err) =>
      // this is in set Time out to for change detection to go through
      setTimeout(() => {
        // control.updateValueAndValidity({ emitEvent: false, selfOnly: true });
        ctrl.setErrors(err, { emitEvent: false });
      }, 5))(control, errors);
    return errors;
  }

  /**
   * validates whether user entered valid origin port
   *
   */

  public validatePort(port, type) {
    // let result = false;
    let errors = null;
    let key1 = '';
    let key2 = '';
    let control = null;
    let flagComponent: AutocompleteFlagComponent = null;
    if (type === 'origin') {
      control = this.searchForm.controls.originPort;
      key1 = 'invalidOriginPort';
      key2 = 'emptyOriginPort';
      flagComponent = this.originPort;
    } else {
      control = this.searchForm.controls.destinationPort;
      key1 = 'invalidDestinationPort';
      key2 = 'emptyDestinationPort';
      flagComponent = this.destinationPort;
    }
    errors = this.validateControls(control, control.value, key1);
    const errors2 = this.validateControls(control, control.value, key2);
    // flagComponent.errorState = errors ? true : false;
    errors = this.combine(errors, errors2);

    const e2 = this.isSameOriginDestination(
      this._searchFormData['originPort'],
      this._searchFormData['destinationPort'],
      'origin'
    );

    if (type === 'origin') {
      // by default origin port is selected. Since we haven't filled dest Port, it should show error
      if (this.searchForm.controls.destinationPort.touched) {
        const e = this.setOrRemoveError(
          this.searchForm.controls.destinationPort,
          'isSameOriginDestination',
          e2
        );
        this.destinationPort.errorState = e ? true : false;
      }
    } else {
      // Since origin port is in Focus by default, its touched. so no point in checking that
      const e = this.setOrRemoveError(
        this.searchForm.controls.originPort,
        'isSameOriginDestination',
        e2
      );
      this.originPort.errorState = e ? true : false;
    }
    errors = this.combine(errors, e2);
    flagComponent.errorState = errors ? true : false;
  }

  /** called on click of search button. Emits status and form value to the parent component */
  public searchButtonClicked() {
    this.disableSearch = true;
    this.srchButtonClicked.emit({
      status: this.searchForm.status,
      value: this.searchForm.value
    });
  }
  public ngOnDestroy() {
    // Unsubscribe all subscriptions
    while (this.subscriptionArray.length > 0) {
      this.subscriptionArray.pop().unsubscribe();
    }
  }
  /** Initialise the search form with appropriate validators */
  private initSearchForm(_searchFormData) {
    this.searchForm = new FormGroup({
      originPort: new FormControl(_searchFormData.originPort, [
        //  Validators.required
      ]),
      departureDate: new FormControl(_searchFormData.departureDate, [
        Validators.required
      ]),
      departureFlexibility: new FormControl(
        _searchFormData.departureFlexibility,
        [Validators.required]
      ),
      destinationPort: new FormControl(_searchFormData.destinationPort, [
        // Validators.required
      ]),
      arrivalDate: new FormControl(_searchFormData.arrivalDate, [
        this.isErrorPresentValidator('invalidArrivalDate') //  Validators.required
      ]),
      maxTrans: new FormControl(_searchFormData.maxTrans, [
        Validators.required
      ]),
      cargoWt: new FormControl(_searchFormData.cargoWt),
      cargoVolumeOption: new FormControl(_searchFormData.cargoVolumeOption)
    });
  }
  private invalidFlexibiliytValue(value: any): ValidationErrors | null {
    const departureDate = this._searchFormData['departureDate'];
    const arrivalDate = this._searchFormData['arrivalDate'];
    const departureFlexibility = value;
    const minArrivalDateAfterCalc = new Date(
      new Date(departureDate).getTime() + this.oneDay * departureFlexibility * 7
    );
    this.arrivalMinDate = minArrivalDateAfterCalc;
    if (arrivalDate === '') {
      /** THis means arrival Date is blank. So we set the min Arrival Date */
      return null;
    }
    /**
     * If the new MinArrivalDate is >= arrival date selected, we are good to go ahead.
     */
    return !this.isDateInRange(
      minArrivalDateAfterCalc.getTime(),
      new Date(arrivalDate).getTime()
    )
      ? {
          invalidFlexibiliytValue: true
        }
      : null;
  }
  /**
   * invalidArrivalDate() will consider deptDate and deptFlexibity[weaks]
   * and calculates minimum date for arrival date and also validates arrival date on
   * change of departure date and dep flexibility
   */
  private invalidArrivalDate(value: any): ValidationErrors | null {
    const departureDate = this._searchFormData['departureDate'];
    let arrivalDate = value;
    const departureFlexibility = this._searchFormData['departureFlexibility'];
    /**
     * If the new MinArrivalDate is >= arrival date selected, we are good to go ahead.
     */
    if (this.isArrivalDateOpen) {
      return null;
    }
    if (!value) {
      arrivalDate = this._searchFormData['departureDate'];
    }
    if (!this.arrivalMinDate) {
      return null;
    }
    return !this.isDateInRange(
      this.arrivalMinDate.getTime(),
      new Date(arrivalDate).getTime()
    )
      ? {
          invalidArrivalDate: true
        }
      : null;
  }

  /** function called when you change departure date. This has to validated with current
   * arrival date and departure flexibility
   */
  private invalidDepartureDate(value: any): ValidationErrors | null {
    const departureDate = value;
    const arrivalDate = this._searchFormData['arrivalDate'];
    const departureFlexibility = this._searchFormData['departureFlexibility'];
    /**
     * If the new MinArrivalDate is >= arrival date selected, we are good to go ahead.
     */

    this.arrivalMinDate = new Date(
      new Date(departureDate).getTime() + this.oneDay * departureFlexibility * 7
    );

    const valid = this.isDateInRange(
      this.arrivalMinDate,
      new Date(arrivalDate).getTime()
    );

    return !valid
      ? {
          invalidDepartureDate: true
        }
      : null;
  }
  /** 2 values are same if they are text and same
   * or if they both are OrginDestinatioDto and have same portCoe
   */
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
  private isDateInRange(smallerDate: number, biggerDate: number): boolean {
    if (isNaN(smallerDate) || isNaN(biggerDate)) {
      return true;
    }
    if (smallerDate - biggerDate < this.oneDay) {
      return true;
    } else {
      return false;
    }
  }
  ngAfterViewInit(): void {
    let e = this.invalidFlexibiliytValue(
      this._searchFormData['departureFlexibility']
    );
  }

  /**
   *
   * Validator to check whether we have a same origin and destination port
   */
  private isSameOriginDestination(
    originValue,
    destinationValue,
    source
  ): ValidationErrors | null {
    return originValue.portCode &&
      destinationValue.portCode &&
      originValue.portCode === destinationValue.portCode
      ? { isSameOriginDestination: true }
      : null;
  }
  /** Validator to check whether we have a valid port or not */
  private isValidPort(value: any, key: string) {
    if (
      /** Either the value doesnt have port code or the value is blank */
      value &&
      !value.portCode /*||
      !value*/
    ) {
      const obj = {};
      obj[key] = true;
      return obj;
    }
    return null;
  }
  /** Validator to check whether we have a valid port or not */
  private isEmptyPort(value: any, key: string) {
    if (
      /** Either the value doesnt have port code or the value is blank */
      !value
    ) {
      const obj = {};
      obj[key] = true;
      return obj;
    }
    return null;
  }
  /** Validator called by origin port to check whether its value is valid or not */
  private invalidOriginPort(value: any): ValidationErrors | null {
    return this.isValidPort(value, 'invalidOriginPort');
  }
  /** Validator called by destiantion port to check whether its value is valid or not */
  private invalidDestinationPort(value: FormControl): ValidationErrors | null {
    return this.isValidPort(value, 'invalidDestinationPort');
  }
  /** Validator called by origin port to check whether its value is valid or not */
  private emptyOriginPort(value: any): ValidationErrors | null {
    return this.isEmptyPort(value, 'emptyOriginPort');
  }
  /** Validator called by destiantion port to check whether its value is valid or not */
  private emptyDestinationPort(value: FormControl): ValidationErrors | null {
    return this.isEmptyPort(value, 'emptyDestinationPort');
  }
  public getOriginErrorMessages() {
    let errorMessage = '';
    Object.keys(this.originGroupRelatedErrorMessages)
      .filter(key => this.originGroupRelatedErrorMessages[key])
      .forEach((key, index) => {
        if (index === 0) {
          errorMessage = this.originGroupRelatedErrorMessages[key];
        } else {
          errorMessage =
            errorMessage + ', ' + this.originGroupRelatedErrorMessages[key];
        }
      });
    return errorMessage;
  }
  public getDestinationErrorMessages() {
    let errorMessage = '';
    Object.keys(this.destinationGroupRelatedErrorMessages)
      .filter(key => this.destinationGroupRelatedErrorMessages[key])
      .forEach((key, index) => {
        if (index === 0) {
          errorMessage = this.destinationGroupRelatedErrorMessages[key];
        } else {
          errorMessage =
            errorMessage +
            ', ' +
            this.destinationGroupRelatedErrorMessages[key];
        }
      });
    return errorMessage;
  }
  /** is the object pass , emptyp? TRUE- if empty */
  private isEmpty(obj: any): boolean {
    if (!obj) {
      return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
  public checkForArrivalDate(event) {
    const c = this.searchForm.controls.arrivalDate;
    // validate control
    const e = this.validateControls(
      c,
      this._searchFormData['arrivalDate'],
      'invalidArrivalDate'
    );
    if (!e) {
      // if no error, remove dep date and dep flexibility error too.
      // dep date/dep flexibility error can be removed by changing arrival date.
      this.setOrRemoveError(
        this.searchForm.controls.departureDate,
        'invalidDepartureDate',
        e
      );
      this.setOrRemoveError(
        this.searchForm.controls.departureFlexibility,
        'invalidFlexibiliytValue',
        e
      );
      this.departureFlexibility &&
        (this.departureFlexibility.errorState = false);
    }
  }
  /** combine errors from 2 error validators */
  private combine(e1, e2) {
    if (!e1) {
      return e2;
    } else if (!e2) {
      return e1;
    }
    return { ...e1, ...e2 };
  }
  public opened() {
    this.isArrivalDateOpen = true;
  }
  public closed() {
    this.isArrivalDateOpen = false;
  }

  isErrorPresentValidator(key: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let isMessagePresent = false;

      if (
        (Object.keys(this.originGroupRelatedErrorMessages).indexOf(key) > -1 &&
          this.originGroupRelatedErrorMessages[key]) ||
        (Object.keys(this.destinationGroupRelatedErrorMessages).indexOf(key) >
          -1 &&
          this.destinationGroupRelatedErrorMessages[key])
      ) {
        isMessagePresent = true;
      }
      if (isMessagePresent) {
        const obj = {};
        obj[key] = true;
        return obj;
      }
      return null;
    };
  }

  public selectOption(): void {
    this.showDropDown = false;
    this.selectedOption = this.selectedOption === 'Tonne' ? 'TEU' : 'Tonne';
    this.searchForm.controls.cargoVolumeOption.setValue(this.selectedOption);
  }
  public editprice() {
    this.readonlyview = !this.readonlyview;
    setTimeout(() => document.getElementById('price-input').focus());
  }
  public markAsReadOnly(event) {
    this.isCo2Readonly = event;
  }
}
/** Message enums */

export enum errorMessages {
  invalidOriginPort = 'Invalid Origin port',
  emptyOriginPort = 'Origin port required',
  invalidFlexibiliytValue = 'Flexibility weeks exceeds Arrived by date',
  invalidDepartureDate = 'Invalid Departure date',
  invalidDestinationPort = 'Invalid Destination port',
  invalidArrivalDate = 'Arrived by required',
  isSameOriginDestination = 'Origin and Destination ports cannot be same',
  emptyDestinationPort = 'Destination port required'
}
