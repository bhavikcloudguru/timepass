import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Router } from '@angular/router';
import { ScheduleService } from 'src/app/shared/api-service/schedule/schedule.service';
import {
  FormGroup,
  AbstractControl,
  ValidationErrors,
  FormControl,
  Validators
} from '@angular/forms';
import { AutocompleteCountryComponent } from 'src/app/shared/components/autocomplete-country/autocomplete-country.component';
import { Subscription } from 'rxjs';
import { startWith, distinctUntilChanged } from 'rxjs/operators';
import { DateAdapter } from '@angular/material/core';
import { Utils } from 'src/app/common/utilities/Utils';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly originGroup = ['invalidOriginCountry', 'emptyOriginCountry'];
  private readonly destinationGroup = [
    'invalidDestinationCountry',
    'emptyDestinationCountry'
  ];

  public originGroupRelatedErrorMessages = [];
  public destinationGroupRelatedErrorMessages = [];
  public regionData: any;
  public regionDataFiltered: any = [];
  public selectedCountries: any;
  public searchForm: FormGroup;
  public disableSearch: boolean;

  public minDate = new Date();

  public startDate = new Date();
  public endDate = new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000);

  @ViewChildren('originCountry', { read: AutocompleteCountryComponent })
  originCountry: QueryList<AutocompleteCountryComponent>;
  @ViewChildren('destinationCountry', { read: AutocompleteCountryComponent })
  destinationCountry: QueryList<AutocompleteCountryComponent>;

  public _searchFormData: any = {};

  public originFormControls: Array<any> = [];
  public destinationFormControls: Array<any> = [];
  public originErrorMessage;
  public destinationErrorMessage;
  private subscriptionArray: Subscription[] = [];
  constructor(
    public dataService: DataService,
    public router: Router,
    public sheduleService: ScheduleService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  ngOnInit(): void {
    this.originFormControls = ['originCountry1'];
    this.destinationFormControls = ['destinationCountry1'];
    this.initSearchForm();
    this.setFormValueSubscriptions();
    this.dataService.getPortListForScheduleSearch().subscribe(response => {
      if (response && response.length) {
        this.regionData = Utils.processCountryData(response);
        // console.log('regionData', this.regionData); //countryCode
      }
    });
  }

  public setFormValueSubscriptions(): void {
    this.subscriptionArray = [];
    const key1 = 'originCountry';
    const key2 = 'destinationCountry';
    Object.keys(this.searchForm.controls).forEach(key => {
      this.subscriptionArray.push(
        this.searchForm.controls[key].valueChanges
          .pipe(
            distinctUntilChanged((x, y) => {
              if (key === key1 || key === key2) {
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
            this.searchForm.setValue(this._searchFormData);
            this.disableSearch = false;
          })
      );
    });
  }

  public addCountryInput(type) {
    if (type === 'originCountry') {
      const cArray = this.originFormControls;
      const adNumber = cArray[this.originFormControls.length - 1].split(
        type
      )[1];
      const adName = type + (Number(adNumber) + 1);
      this.originFormControls.push(adName);
      this._searchFormData[adName] = '';
      this.searchForm.addControl(adName, new FormControl('', []));
    } else {
      const cArray = this.destinationFormControls;
      const adNumber = cArray[this.destinationFormControls.length - 1].split(
        type
      )[1];
      const adName = type + (Number(adNumber) + 1);
      this.destinationFormControls.push(adName);
      this._searchFormData[adName] = '';
      this.searchForm.addControl(adName, new FormControl('', []));
    }
    this.setFormValueSubscriptions();
  }

  public removeCountry(type, index): void {
    if (type === 'origin') {
      const formItem = this.originFormControls[index];
      this.originFormControls.splice(index, 1);
      delete this._searchFormData[formItem];
      this.searchForm.removeControl(formItem);
      const originFormData = this.originCountry['_results'];
      this.errorOriginValidation();
    } else {
      const formItem = this.destinationFormControls[index];
      this.destinationFormControls.splice(index, 1);
      delete this._searchFormData[formItem];
      this.searchForm.removeControl(formItem);
      this.errorDestinationValidation();
    }
  }

  public errorOriginValidation() {
    setTimeout(() => {
      let cSet = new Set();
      const originFormData = this.originCountry['_results'];
      const hasDuplicates = originFormData.some(_obj => {
        return cSet.size === cSet.add(_obj['_value'].countryCode).size;
      });
      if (!hasDuplicates) {
        this.originErrorMessage = '';
        this.originCountry.forEach(element => {
          element.errorState = false;
        });
      }
    }, 1);
  }

  public errorDestinationValidation() {
    setTimeout(() => {
      let cSet = new Set();
      const destinationFormData = this.destinationCountry['_results'];
      const hasDuplicates = destinationFormData.some(_obj => {
        return cSet.size === cSet.add(_obj['_value'].countryCode).size;
      });
      if (!hasDuplicates) {
        this.destinationErrorMessage = '';
        this.destinationCountry.forEach(element => {
          element.errorState = false;
        });
      }
    }, 1);
  }

  public onSubmit(type: string): void {
    console.log(this._searchFormData);
    let startDateParam = '';
    let endDateParam = '';
    /** Changing params to /originCode1-originName1-originCode2-orignName-2/destintationCode1-destinatioName1.... */
    let oParams = '';
    let dParams = '';
    Object.keys(this._searchFormData).forEach(k => {
      if (k.indexOf('originCountry') === 0) {
        const v = this._searchFormData[k];
        oParams = oParams + '-' + v.countryCode + '-' + v.countryName;
      } else if (k.indexOf('destinationCountry') === 0) {
        const v = this._searchFormData[k];
        dParams = dParams + '-' + v.countryCode + '-' + v.countryName;
      }
    });
    oParams = oParams.substring(1);
    dParams = dParams.substring(1);

    startDateParam = this.dateAdapter.format(
      this._searchFormData.startDate,
      'date-time-view'
    );
    endDateParam = this.dateAdapter.format(
      this._searchFormData.endDate,
      'date-time-view'
    );
    /*const param =
      this._searchFormData.originCountry1.countryCode +
      '-' +
      this._searchFormData.originCountry1.countryName +
      '-' +
      this._searchFormData.destinationCountry1.countryCode +
      '-' +
      this._searchFormData.destinationCountry1.countryName;*/
    this.sheduleService.setScheduleData(this.selectedCountries);
    if (!type) {
      this.router.navigate([
        '/schedule-builder/details',
        oParams + '__' + dParams + '__' + startDateParam + '__' + endDateParam
      ]);
    } else {
      this.router.navigate([
        '/schedule-builder/details',
        oParams + '__' + dParams + '____VSS'
      ]);
    }
  }

  public validatePort(event, type, compRef, name): void {
    let searchName;
    if (compRef && compRef._value) {
      searchName = compRef._value.countryCode;
      if (type === 'origin') {
        const originFormData = this.originCountry['_results'];
        const count = originFormData.filter(
          item => item['_value'].countryCode === searchName
        ).length;
        if (count > 1) {
          this.originErrorMessage = errorMessages.MultipleOriginCountries;
          compRef.errorState = true;
        } else {
          this.errorOriginValidation();
          // call the service...
          if (searchName) {
            this.dataService
              .getOperationalCountries(searchName)
              .subscribe(s => {
                //console.log('****', s, searchName, s[searchName]);
                if (s && s[searchName]) {
                  this.regionDataFiltered = this.regionData.filter(
                    r => s[searchName].indexOf(r.countryCode) > -1
                  );
                } else {
                  this.regionDataFiltered = this.regionDataFiltered || [];
                }
              });
          }
        }
      } else if (type === 'destination') {
        const destinationFormData = this.destinationCountry['_results'];
        const count = destinationFormData.filter(
          item => item['_value'].countryCode === searchName
        ).length;
        if (count > 1) {
          this.destinationErrorMessage =
            errorMessages.MultipleDestinationCountries;
          compRef.errorState = true;
        } else {
          this.errorDestinationValidation();
        }
      }
    }
  }

  public selectedItem(item: any) {
    this.selectedCountries[item.type] = item._c;
  }

  public originalOrder(a, b) {
    return 1;
  }

  public getOriginErrorMessages() {
    return '';
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

  private initSearchForm() {
    const group = {};
    this.originFormControls.forEach(item => {
      group[item] = new FormControl('', [Validators.required]);
      this._searchFormData[item] = '';
    });

    this.destinationFormControls.forEach(item => {
      group[item] = new FormControl('', []);
      this._searchFormData[item] = '';
    });

    group['startDate'] = new FormControl(this.startDate, [Validators.required]);
    this._searchFormData['startDate'] = this.startDate;

    group['endDate'] = new FormControl(this.endDate, [Validators.required]);
    this._searchFormData['endDate'] = this.endDate;

    this.searchForm = new FormGroup(group);
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
}

export enum errorMessages {
  invalidOriginCountry = 'Invalid Origin Country',
  emptyOriginCountry = 'Origin Country required',
  invalidDestinationCountry = 'Invalid Destination port',
  isSameOriginDestination = 'Origin and Destination ports cannot be same',
  emptyDestinationCountry = 'Destination port required',
  MultipleOriginCountries = 'Same origin country selected. Choose a different country to continue.',
  MultipleDestinationCountries = 'Same destination country selected. Choose a different country to continue.'
}
