import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';
import { CCMDataService } from 'src/app/ccm.data.service';
import { Utils } from 'src/app/common/utilities/Utils';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { FeedbackComponent } from 'src/app/shared/components/feedback/feedback.component';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { TimePickerComponent } from 'src/app/shared/components/time-picker/time-picker.component';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';

@Component({
  selector: 'app-deadlines',
  templateUrl: './deadlines.component.html',
  styleUrls: ['./deadlines.component.scss']
})
export class DeadlinesComponent implements OnInit {
  /** This subject will be used to unsubscribe all observables in this component */
  private destroy$: Subject<boolean> = new Subject<boolean>();
  public originalResponseData = []; // original data. Unfiltered.
  public responseData = []; // filtered data. Filtered based upon selected country
  public isEditAccessible = false; // Is edit accessible.
  public isEditEnabled = false; // Is edit enabled?
  public isReadOnly = true; // is readonly?
  public countries = []; // countries list for dropdown.
  public events = { importEvent: [], exportEvent: [] }; // events dropdown
  public uom = []; // uom dropdown
  public editFormArray = new FormArray([]); // formArray for edit form
  private defaultEvent = { imports: {}, exports: {} };
  private defaultUoM = {};
  public pageCount = 1;
  public pageLimit = 2;
  public removeIndex = -1;
  public updatedCountries = [];
  public accessDenied = true;
  /** Form for countries dropdown */
  public countryForm = new FormGroup({
    selectedCountry: new FormControl('')
  });

  @HostListener('body:scroll', ['$event'])
  onWindowScroll(event: any) {
    if (!this.isEditEnabled) {
      return;
    }
    let tracker = event.target;
    let limit = tracker.scrollHeight - tracker.clientHeight - 15;
    let selectedCountry = this.countryForm.controls['selectedCountry'];
    if (selectedCountry.value) {
      return;
    }
    if (event.target.scrollTop >= limit) {
      if (this.pageCount > this.pageLimit) {
        this.removeIndex += 1;
        this.removeResponseData();
      }
      this.pageCount += 1;
      this.addResponseData();
    }
    let pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    if (pos == max) {
      this.addToTop();
    }
  }

  constructor(
    private ccmDataService: CCMDataService,
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    /** Fetch countries, events and uom. Without these, you cant fetch deadlines */
    forkJoin([
      this.ccmDataService.getCountries(),
      this.ccmDataService.getEvents(),
      this.ccmDataService.getUnitOfMeasurements()
    ]).subscribe(r => {
      console.log('combined response', r);
      // object destructuring
      const [countries, events, uoms] = r;
      this.countries = countries;
      this.events = events;
      this.uom = uoms;
      this.defaultUoM = uoms.filter(e => e.default)[0];
      this.defaultEvent.exports = events.exportEvent.filter(e => e.default)[0];
      this.defaultEvent.imports = events.importEvent.filter(e => e.default)[0];
      this.fetchDeadlines();
    });
  }

  ngAfterViewInit(): void {
    this.countryForm.controls['selectedCountry'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        /** Filtering the fetched deadlines based on selected country */
        if (v && v.countryCode) {
          this.responseData = this.originalResponseData.filter(
            x => x.code === v.countryCode
          );
          this.responseData = [...this.responseData];
        } else {
          //this.responseData = this.originalResponseData;
          this.responseData = this.originalResponseData.slice(0, 10);
          this.responseData = [...this.responseData];
        }
        this.checkUpdatedData();
        this.prepareEditForm();
      });
  }

  // Request access code. Feedback form opened.
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
  // this function marks the page as readonly. Invoked from appAllowAccessDirective
  public markAsReadOnly(readOnly: boolean) {
    this.isReadOnly = readOnly;
    this.isEditAccessible = !readOnly;
    this.changeDetectorRef.detectChanges();
  }
  // this function marks the page as readonly. Invoked from appAllowAccessDirective
  // Ideally this shouuld be used when the user doesn't have access at all.
  public markAsAccessDenied(accessDenied: boolean) {
    // this.isEditAccessible = !accessDenied;
    this.accessDenied = accessDenied;
    this.changeDetectorRef.detectChanges();
  }
  // toggle - readonly to edit mode
  public toggle() {
    if (this.isReadOnly) {
      this.isEditEnabled = false;
    } else {
      this.isEditEnabled = !this.isEditEnabled;
    }
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  // this is used as the [displayWith] function. Returns a function (string)=>string
  public showOptionName(events) {
    return (option: any) => {
      const obj = events.find(x => x.id === option);
      return obj ? obj.name : '';
    };
  }
  /** SHow time picker when TIME (id==3) is selected. */
  public showPicker(editItem, i: number, source: string, type: string, e: any) {
    /* if (
      (this.editFormArray.at(i) as FormGroup).value['deadlines'][source][
        'uomTimeID'
      ] !== 3
    ) {
      return;
    } */ // If TIME is selected
    // fetch the form control associated with duration. Used to set value based on picker selection
    const formControl = (this.editFormArray.at(i) as FormGroup).controls[
      'deadlines'
    ]['controls'][source]['controls'][type];
    console.log(formControl);
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    // position the dialog where the mouse was clicked.
    let expPos = 0;
    var maxh = window.innerHeight - e.clientY;
    if (maxh < 350) {
      expPos = 300 - maxh;
    }

    matDialogConfig.position = {
      left: e.clientX - 20 + 'px',
      top: e.clientY - 100 - expPos + 'px'
    };
    // in case formControl value is '' make it 00:00 so that split doesnt break
    let currentValue = formControl.value || '00:00';
    //let currentValue = '00:00';
    currentValue =
      currentValue.indexOf(':') === -1 ? currentValue + ':00' : currentValue;
    const [hour, min] = currentValue.split(':');

    const dialogRef: MatDialogRef<TimePickerComponent> = this.dialog.open(
      TimePickerComponent,

      {
        width: '296px',
        height: '351px',
        data: {
          hour,
          min
        },
        panelClass: 'no-bg',

        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.updatePosition(matDialogConfig.position);
    // set value to the formControl in the subscription of the event emitter;
    dialogRef.componentInstance.timeEmitted
      .pipe(takeUntil(this.destroy$))
      .subscribe(x => {
        const time =
          ('00' + x.hour).slice(-2) + ':' + ('00' + x.mins).slice(-2);
        formControl.setValue(time);
        editItem[type] = time;
        formControl.markAsDirty();
      });
    dialogRef.afterClosed().subscribe(result => {});
  }
  // prepare the edit form for edit mode.
  private prepareEditForm(): void {
    this.editFormArray.clear();
    /** Creating form in such a way that the structure remains the same
     * We want to keep the structure of request of save deadline matching with
     * response of find deadlines. Hence this complex form desing.
     */

    this.responseData.forEach((value, index) => {
      const importsFormGroup = new FormGroup({
        swireEventID: new FormControl(value.deadlines.imports.swireEventID),
        swireTime: new FormControl(value.deadlines.imports.swireTime),
        swireTimeID: new FormControl(value.deadlines.imports.swireTimeID),
        swireAmount: new FormControl(value.deadlines.imports.swireAmount),
        regulatoryEventID: new FormControl(
          value.deadlines.imports.regulatoryEventID
        ),
        regulatoryTime: new FormControl(value.deadlines.imports.regulatoryTime),
        regulatoryTimeID: new FormControl(
          value.deadlines.imports.regulatoryTimeID
        ),
        regulatoryAmount: new FormControl(
          value.deadlines.imports.regulatoryAmount
        ),
        display: new FormControl(value.deadlines.imports.display)
      });
      const exportsFormGroup = new FormGroup({
        swireEventID: new FormControl(value.deadlines.exports.swireEventID),
        swireTime: new FormControl(value.deadlines.exports.swireTime),
        swireTimeID: new FormControl(value.deadlines.exports.swireTimeID),
        swireAmount: new FormControl(value.deadlines.exports.swireAmount),
        regulatoryEventID: new FormControl(
          value.deadlines.exports.regulatoryEventID
        ),
        regulatoryTime: new FormControl(value.deadlines.exports.regulatoryTime),
        regulatoryTimeID: new FormControl(
          value.deadlines.exports.regulatoryTimeID
        ),
        regulatoryAmount: new FormControl(
          value.deadlines.exports.regulatoryAmount
        ),
        display: new FormControl(value.deadlines.exports.display)
      });
      const deadlinesFormGroup = new FormGroup({
        imports: importsFormGroup,
        exports: exportsFormGroup
      });
      const formGroup = new FormGroup({
        code: new FormControl(value.code),
        countryName: new FormControl(value.countryName),
        deadlines: deadlinesFormGroup,
        updatedBy: new FormControl(value.updatedBy)
      });
      this.editFormArray.push(formGroup);
    });
  }
  private fetchDeadlines(): void {
    /** Deadlines fetched. */
    this.loader.show();
    this.ccmDataService.getDeadlinesData('').subscribe((response: any[]) => {
      this.loader.hide();
      this.prepareData(response);
      this.prepareEditForm();
    });
  }

  private prepareData(response: any[]): void {
    console.log({ ...response });

    const countriesWithoutData = this.countries.filter(
      x => response.findIndex(r => x.countryCode === r.code) == -1
    );
    response = response.map(r => {
      let data = r;
      data.deadlines.imports.swireAmount =
        r.deadlines.imports.swireAmount === '0'
          ? ''
          : r.deadlines.imports.swireAmount;
      data.deadlines.imports.regulatoryAmount =
        r.deadlines.imports.regulatoryAmount === '0'
          ? ''
          : r.deadlines.imports.regulatoryAmount;
      data.deadlines.exports.swireAmount =
        r.deadlines.exports.swireAmount === '0'
          ? ''
          : r.deadlines.exports.swireAmount;
      data.deadlines.exports.regulatoryAmount =
        r.deadlines.exports.regulatoryAmount === '0'
          ? ''
          : r.deadlines.exports.regulatoryAmount;
      return data;
    });
    // This is needed for EDIT mode. In edit mode, we need to show all the countries
    // so , for countries with no deadlines,we populated the data with empty/default value.
    this.originalResponseData = [
      ...response,
      ...countriesWithoutData.map(x => {
        return {
          code: x.countryCode,
          countryName: x.countryName,
          deadlines: {
            exports: {
              swireEvent: this.defaultEvent.exports['name'],
              swireEventID: this.defaultEvent.exports['id'],
              swireTime: this.defaultUoM['name'],
              swireTimeID: this.defaultUoM['id'],
              swireAmount: '',
              regulatoryEvent: this.defaultEvent.exports['name'],
              regulatoryEventID: this.defaultEvent.exports['id'],
              regulatoryTime: this.defaultUoM['name'],
              regulatoryTimeID: this.defaultUoM['id'],
              regulatoryAmount: '',
              display: false
            },
            imports: {
              swireEvent: this.defaultEvent.imports['name'],
              swireEventID: this.defaultEvent.imports['id'],
              swireTime: this.defaultUoM['name'],
              swireTimeID: this.defaultUoM['id'],
              swireAmount: '',
              regulatoryEvent: this.defaultEvent.imports['name'],
              regulatoryEventID: this.defaultEvent.imports['id'],
              regulatoryTime: this.defaultUoM['name'],
              regulatoryTimeID: this.defaultUoM['id'],
              regulatoryAmount: '',
              display: false
            }
          }
        };
      })
    ];
    this.responseData = this.originalResponseData;

    this.responseData = this.originalResponseData.slice(0, 10);
    console.log(this.responseData);
  }
  public toggleDisplay(editItem, formControl: FormControl): void {
    editItem.display = !editItem.display;
    formControl.setValue(editItem.display);
    formControl.markAsDirty();
  }

  public selectOption(
    editItem,
    type,
    typeName,
    value,
    formcontrol: FormControl,
    idFormControl: FormControl,
    selectType,
    amountType?: string
  ) {
    if (value === 2 || value === 5 || value === 7) {
      editItem[amountType] = '';
      this.selectTime(editItem, 'Time', selectType, formcontrol, idFormControl);
    }
    if (value === 8 || value === 9) {
      editItem[amountType] = '';
      this.selectTime(editItem, 'Days', selectType, formcontrol, idFormControl);
    }
    let indexes = [1, 3, 4, 6];
    if (indexes.includes(value)) {
      this.selectTime(
        editItem,
        'Hours',
        selectType,
        formcontrol,
        idFormControl
      );
    }

    console.log(this.events);
    let allEvents = this.events.importEvent.concat(this.events.exportEvent);
    console.log(allEvents);
    let sEvent = allEvents.find(item => item.id === value);
    editItem[type] = value;
    editItem[typeName] = sEvent.name;
  }

  public selectTime(
    selecteditem,
    event: string,
    type: string,
    formControl: FormControl,
    idFormControl?: FormControl,
    eventId?: any,
    deadline?: string
  ) {
    if (eventId === 8 || eventId === 9) {
      return;
    }
    if (deadline) {
      selecteditem[deadline + 'Amount'] = '';
    }
    let uom = this.uom.find(item => item.name === event);
    selecteditem[type] = event;
    selecteditem[type + 'ID'] = uom?.id ? uom.id : '';
    formControl.setValue(event);
    idFormControl.setValue(uom?.id ? uom.id : '');
  }

  public toggleUOM(source: string, index, id: any) {
    /* let formControl = this.editFormArray.at(index)['controls']['deadlines'][
      'controls'
    ][source]['controls']['uomTimeID'];
    formControl.setValue(id);
    formControl.markAsDirty();
    this.responseData[index]['deadlines'][source]['uomTimeID'] = id;
    this.responseData[index]['deadlines'][source]['uomTime'] = this.uom.find(
      u => u.id === id
    ).name; */
  }
  public submitForm() {
    const isDirty = this.editFormArray.dirty;

    this.checkUpdatedData();
    if (this.updatedCountries.length) {
      let updatedValues = [];
      this.updatedCountries.forEach(c => {
        let getCountry = this.originalResponseData.find(
          item => item.code === c
        );
        updatedValues.push(getCountry);
      });
      // email id of the person updating the values
      const currentlyLoggedInUserInfoKeyCloak =
        Utils.currentlyLoggedInUserInfoKeyCloak;
      if (
        currentlyLoggedInUserInfoKeyCloak.userClaims &&
        currentlyLoggedInUserInfoKeyCloak.userClaims.email
      ) {
        updatedValues = updatedValues.map(u => {
          let item = u;
          item.deadlines.imports.swireAmount =
            u?.deadlines?.imports?.swireAmount === ''
              ? 0
              : u?.deadlines?.imports?.swireAmount;
          item.deadlines.imports.regulatoryAmount =
            u?.deadlines?.imports?.regulatoryAmount === ''
              ? 0
              : u?.deadlines?.imports?.regulatoryAmount;
          item.deadlines.exports.swireAmount =
            u?.deadlines?.exports?.swireAmount === ''
              ? 0
              : u?.deadlines?.exports?.swireAmount;
          item.deadlines.exports.regulatoryAmount =
            u?.deadlines?.exports?.regulatoryAmount === ''
              ? 0
              : u?.deadlines?.exports?.regulatoryAmount;
          item.deadlines.updatedBy =
            currentlyLoggedInUserInfoKeyCloak.userClaims.email;
          return item;
        });
        console.log('updated values -', updatedValues);
        this.loader.show();
        this.ccmDataService.saveDeadlines(updatedValues).subscribe((x: any) => {
          this.loader.hide();
          if (x && x.hasOwnProperty('countyCodeFailed')) {
            if (x['countyCodeFailed'].length === 0) {
              console.log('saved');
              this.isEditEnabled = false;
              this.editFormArray.markAsPristine();
              this.fetchDeadlines();
            } else {
              console.log('error for countryCodes,', x['countyCodeFailed']);
            }
          } else {
            console.log('Error occurred', x);
          }
        });
      }
    }
  }

  public addResponseData(): void {
    let fIndex = (this.pageCount - 1) * 10;
    this.checkUpdatedData();
    let addItem = this.originalResponseData.slice(fIndex, fIndex + 10);
    this.responseData = this.responseData.concat(addItem);
    this.prepareEditForm();
  }
  public removeResponseData(): void {
    this.checkUpdatedData();
    this.responseData = this.responseData.slice(10, this.responseData.length);
    let _element = document.getElementById('item-data-view');
    let offHeight =
      _element && _element.offsetHeight > 0 ? _element.offsetHeight * 10 : 1;
    document.body.scrollTop = document.body.scrollTop - offHeight;
  }

  public addToTop() {
    if (this.removeIndex >= 0) {
      let addItems = this.originalResponseData.slice(
        this.removeIndex * 10,
        this.removeIndex * 10 + 10
      );
      this.removeIndex = this.removeIndex - 1;
      this.checkUpdatedData();
      this.responseData = addItems.concat(this.responseData);
      let _element = document.getElementById('item-data-view');
      let offHeight =
        _element && _element.offsetHeight > 0 ? _element.offsetHeight * 10 : 1;
      document.body.scrollTop = document.body.scrollTop + offHeight;
      this.prepareEditForm();
    }
  }

  public checkUpdatedData(): void {
    const isDirty = this.editFormArray.dirty;
    if (isDirty) {
      this.editFormArray.controls.forEach(c => {
        if (!this.updatedCountries.includes(c.value.code)) {
          c.dirty ? this.updatedCountries.push(c.value.code) : '';
        }
      });
    }
  }

  public cancelEdit(): void {
    this.fetchDeadlines();
    this.isEditEnabled = false;
  }
}
