import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { formatDate, KeyValue } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CCMDataService } from 'src/app/ccm.data.service';
import { Utils } from 'src/app/common/utilities/Utils';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { FeedbackComponent } from 'src/app/shared/components/feedback/feedback.component';
import { Pricing } from 'src/app/shared/models/Pricing';

@Component({
  selector: 'app-pricing-surcharges',
  templateUrl: './pricing-surcharges.component.html',
  styleUrls: ['./pricing-surcharges.component.scss']
})
export class PricingSurchargesComponent implements OnInit {
  public eview = true;
  public quantityTypes;
  public unitOfMeasures;
  public countries = []; // countries list for dropdown.
  public isEditEnabled = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  /** Form for countries dropdown */
  public pricingSurcharges = {};
  public selectedKey;
  public item: any;
  public countryForm = new FormGroup({
    selectedCountry: new FormControl('')
  });
  public pricing = new Pricing();
  public originalPricing;
  public displayData;

  public pageCount = 1;
  public pageLimit = 25;
  public removeIndex = -1;
  public pricingDef;
  public surcharges = [];
  public customers = {};
  public updatedSurcharges = [];
  public pricingDetails: any;
  public mindate = new Date();
  public defaultFilter;
  public filteredData;
  public isEditAccessible = false; // Is edit accessible.
  public isReadOnly = true; // is readonly?
  public accessDenied = true;
  public allCountries;
  @HostListener('body:scroll', ['$event'])
  onWindowScroll(event: any) {
    if (!this.isEditEnabled) {
      return;
    }

    this.csTrigger?.forEach(element => {
      element.closePanel();
    });

    this.surchargeTrigger?.forEach(element => {
      element.closePanel();
    });

    this.uomTrigger?.forEach(element => {
      element.closePanel();
    });

    let tracker = event.target;
    let limit = tracker.scrollHeight - tracker.clientHeight - 5;
    let selectedCountry = this.countryForm.controls['selectedCountry'];
    if (selectedCountry.value) {
      return;
    }
    //console.log(event.target.scrollTop + '-' + limit);
    if (event.target.scrollTop >= limit) {
      if (this.pageCount > this.pageLimit) {
        this.removeIndex += 1;
        //this.removeResponseData();
      }
      this.pageCount += 1;
      this.addResponseData();
    }
    let pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    if (pos == max) {
      //this.addToTop();
    }
  }

  @ViewChildren('csTrigger', { read: MatAutocompleteTrigger })
  csTrigger: QueryList<MatAutocompleteTrigger>;

  @ViewChildren('surchargeTrigger', { read: MatAutocompleteTrigger })
  surchargeTrigger: QueryList<MatAutocompleteTrigger>;

  @ViewChildren('uomTrigger', { read: MatAutocompleteTrigger })
  uomTrigger: QueryList<MatAutocompleteTrigger>;

  public sortByFilterList: { view: string; value: string }[] = [
    {
      view: 'All surcharge validities',
      value: ''
    },
    {
      view: ' Valid surcharges only',
      value: 'Effective'
    },
    {
      view: 'Expired surcharges only',
      value: 'Expire'
    },
    {
      view: 'Future surcharges only',
      value: 'Future'
    }
  ];

  constructor(
    public ccmDataService: CCMDataService,
    public loader: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.defaultFilter = this.sortByFilterList[1];
    this.mindate.setDate(new Date().getDate() + 1);
    this.quantityTypes = [
      {
        quantityId: 1,
        label: 'Equal to'
      },
      {
        quantityId: 2,
        label: 'Up to'
      },
      {
        quantityId: 3,
        label: 'More than'
      }
    ];

    this.unitOfMeasures = [
      {
        id: 1,
        name: 'Lines'
      },
      {
        id: 2,
        name: 'Containers'
      },
      {
        id: 3,
        name: 'Documents'
      },
      {
        id: 4,
        name: 'Requests'
      },
      {
        id: 5,
        name: 'Packages'
      },
      {
        id: 6,
        name: 'Files'
      }
    ];
    var currencyCodes = [
      {
        code: 'PG',
        currency: 'PGK'
      },
      {
        code: 'SB',
        currency: 'SBD'
      },
      {
        code: 'FJ',
        currency: 'FJD'
      }
    ];
    this.loader.show();

    forkJoin([
      this.ccmDataService.getCountries(),
      this.ccmDataService.getDeadlinesData('')
    ]).subscribe(r => {
      r[0].map(item => {
        let cntry = currencyCodes.find(c => item.countryCode === c.code);
        if (cntry) {
          item.currency = cntry.currency;
        }
        return { ...item };
      });
      this.allCountries = r[0];
      const arrayFiltered = r[0].filter(el => {
        return r[1].some(f => {
          return (
            f.code === el.countryCode &&
            (f.deadlines?.exports?.display || f.deadlines?.imports?.display)
          );
        });
      });
      this.countries = arrayFiltered;
      this.fetchPricingDetails();
    });
  }

  public selectFilterItem(event) {
    if (!this.pricingDef) return;
    let originalData = JSON.parse(this.pricingDef);
    for (const key in originalData) {
      if (Object.prototype.hasOwnProperty.call(originalData, key)) {
        const element = originalData[key];
        if (event.value) {
          const surcharge = element.surcharge.filter(
            item => item.valid === event.value
          );
          element.surcharge = surcharge;
        }
      }
    }
    this.filteredData = originalData;
  }

  public groupCustomersByCountry(data): void {
    this.customers = {};
    for (const customer of data) {
      if (!this.customers[customer.countryCode]) {
        this.customers[customer.countryCode] = [];
        this.customers[customer.countryCode].push(customer);
      } else {
        this.customers[customer.countryCode].push(customer);
      }
    }
  }

  public getSurchargeApis(): void {
    this.loader.show();
    forkJoin([
      this.ccmDataService.getSurcharges(),
      this.ccmDataService.getCustomers()
    ]).subscribe(r => {
      this.loader.hide();
      this.surcharges = r[0];

      this.groupCustomersByCountry(r[1]);
      this.pricing.setPricing(
        this.pricingDetails,
        this.countries,
        this.allCountries,
        this.customers
      );
      this.pricingDef = JSON.stringify(this.pricing.countryGroup);

      this.originalPricing = { ...this.pricing.countryGroup };

      //this.displayData = this.originalPricing.slice(0, 10);
      this.displayData = Object.keys(this.originalPricing)
        .slice(0, 10)
        .reduce((result, key) => {
          result[key] = this.originalPricing[key];
          return result;
        }, {});
    });
  }

  ngAfterViewInit(): void {
    this.countryForm.controls['selectedCountry'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        /** Filtering the fetched deadlines based on selected country */
        if (v && v.countryCode && v.countryName) {
          this.selectedKey = v.countryCode;
          let selectedGroup = {};
          selectedGroup[this.selectedKey] = this.originalPricing[
            this.selectedKey
          ];
          this.displayData = selectedGroup;
        } else {
          if (!this.originalPricing) {
            return;
          }
          this.selectedKey = '';
          this.displayData = Object.keys(this.originalPricing)
            .slice(0, 10)
            .reduce((result, key) => {
              result[key] = this.originalPricing[key];
              return result;
            }, {});
        }
      });
  }

  public fetchPricingDetails() {
    this.loader.show();
    this.ccmDataService.getPricingDetails().subscribe((res: any) => {
      this.loader.hide();

      const arrayFiltered = res.filter(el => {
        return this.countries.some(f => {
          return f.countryCode === el.countryCode;
        });
      });
      this.pricingDetails = arrayFiltered;
      this.pricing.setPricing(arrayFiltered, this.countries, this.allCountries);
      this.pricingDef = JSON.stringify(this.pricing.countryGroup);
      this.originalPricing = { ...this.pricing.countryGroup };
      this.selectFilterItem(this.defaultFilter);
    });
  }

  public addResponseData(): void {
    if (this.originalPricing) {
      let fIndex = (this.pageCount - 1) * 10;
      console.log(this.originalPricing);
      let addItem = Object.keys(this.originalPricing)
        .slice(fIndex, fIndex + 10)
        .reduce((result, key) => {
          result[key] = this.originalPricing[key];
          return result;
        }, {});
      this.displayData = { ...this.displayData, ...addItem };
    }
  }

  onSelectEditView() {
    this.isEditEnabled = !this.isEditEnabled;
    this.getSurchargeApis();
  }

  cancelEditView() {
    this.isEditEnabled = !this.isEditEnabled;
    this.fetchPricingDetails();
  }

  ondisable() {
    this.eview = !this.eview;
  }

  toggleDisplay(key) {
    this.originalPricing[key].display = !this.originalPricing[key].display;
    if (this.originalPricing[key] && this.originalPricing[key].surcharge)
      this.originalPricing[key].surcharge.forEach(element => {
        element.display = this.originalPricing[key].display;
      });
  }

  originalOrder = (
    a: KeyValue<number, string>,
    b: KeyValue<number, string>
  ): number => {
    return 0;
  };

  public addSurcharge(event, key): void {
    let selectedCountry = this.countries.find(c => c.countryCode === key);
    let product = this.pricing.createNewProduct(
      selectedCountry,
      this.allCountries,
      this.customers,
      'add'
    );
    this.originalPricing[key].surcharge.push(product);
  }

  public deleteSurcharge(event, index, key) {
    let surcharges = this.originalPricing[key]?.surcharge;
    if (surcharges.length) {
      let id = surcharges[index].id;
      this.loader.show();
      this.ccmDataService.deleteSurcharge(id).subscribe((x: any) => {
        this.loader.hide();
        this.pricing.deleteSurcharge(index, key);
      });
    }
  }

  public selectQuantity(event, surcharge): void {
    if (event) {
      surcharge.priceQuantity = {
        id: event?.type?.quantityId,
        name: event?.type?.label
      };
      surcharge.quantityValue = event?.ivalue;
    }
  }

  public saveData() {
    this.checkDifference();
    const currentlyLoggedInUserInfoKeyCloak =
      Utils.currentlyLoggedInUserInfoKeyCloak;
    if (
      currentlyLoggedInUserInfoKeyCloak.userClaims &&
      currentlyLoggedInUserInfoKeyCloak.userClaims.email
    ) {
      let saveJson = this.pricing.savePricing(
        this.updatedSurcharges,
        currentlyLoggedInUserInfoKeyCloak
      );
      this.loader.show();
      this.ccmDataService.savePricingDetails(saveJson).subscribe((res: any) => {
        this.loader.hide();
        if (res?.error?.message) {
          alert(res?.error?.message);
        } else {
          this.cancelEditView();
        }
      });
    }
  }

  public selectSurchargeOption(e, surcharge) {
    surcharge.priceSurcharge.name = e.option?.value?.name;
    surcharge.priceSurcharge.code = e.option?.value?.code;
  }

  public showOptionName() {
    return (option: any) => {
      if (option) return option.name;
    };
  }

  public selectSurchargeType(name, surcharge) {
    surcharge.chargeType = name;
    if (name === 'Tariff') {
      surcharge.customerName = '';
      surcharge.customerCode = '';
    }
  }

  public checkDifference() {
    if (!this.pricingDef) return;
    let surcharges = [];
    let originalData = JSON.parse(this.pricingDef);
    for (const key in originalData) {
      if (Object.prototype.hasOwnProperty.call(originalData, key)) {
        const element = originalData[key];

        let isSame =
          JSON.stringify(element) === JSON.stringify(this.originalPricing[key])
            ? true
            : false;
        if (!isSame) {
          let pricingSurcharges = this.originalPricing[key].surcharge;
          surcharges = surcharges.concat(pricingSurcharges);
        }
      }
    }
    this.updatedSurcharges = surcharges;
  }

  public addStartDate(product, event) {
    const prevValue = product.validityStart;
    let start = formatDate(event.value, 'yyyy-MM-dd', 'en-US');

    if (
      product.editable.startdate === false &&
      formatDate(new Date(prevValue), 'yyyy-MM-dd', 'en-US') !== start
    ) {
      alert('you cannot change start date');
      product.validityStart = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
      setTimeout(() => {
        product.validityStart = formatDate(
          new Date(prevValue),
          'yyyy-MM-dd',
          'en-US'
        );
      }, 100);
    } else {
      product.validityStart = start;
    }
  }
  public prevValue;
  public addEndDate(product, event) {
    this.prevValue = product.validityEnd;

    let start = formatDate(product.validityStart, 'yyyy-MM-dd', 'en-US');
    let end = formatDate(event.value, 'yyyy-MM-dd', 'en-US');
    if (new Date(start) < new Date(end)) {
      product.validityEnd = end;
    }
  }

  public onClose(product, $event): void {
    product.validityEnd = formatDate(
      product.validityEnd,
      'yyyy-MM-dd',
      'en-US'
    );
  }

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

  public showCustomerName(event) {
    if (event && event.customerName) {
      return event.customerName;
    }
    return '';
  }

  modelChange(event): void {}
}
