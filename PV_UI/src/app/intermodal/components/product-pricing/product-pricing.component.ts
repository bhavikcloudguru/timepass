import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CCMDataService } from 'src/app/ccm.data.service';
import { Utils } from 'src/app/common/utilities/Utils';
import { ITMSDataService } from 'src/app/itms.data.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { FeedbackComponent } from 'src/app/shared/components/feedback/feedback.component';

@Component({
  selector: 'app-product-pricing',
  templateUrl: './product-pricing.component.html',
  styleUrls: ['./product-pricing.component.scss']
})
export class ProductPricingComponent implements OnInit, AfterViewInit {
  public countries = [];
  public selectedKey;
  public isEditEnabled = false;
  public isEditAccessible = false;
  public isReadOnly = true;
  public accessDenied = true;
  public countryForm = new FormGroup({
    selectedCountry: new FormControl('')
  });
  public responseData = [];
  public originalResponseData = [];
  public editFormArray = new FormArray([]);
  private destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    public ccmDataService: CCMDataService,
    public itmsDataService: ITMSDataService,
    public dialog: MatDialog,
    public loader: LoaderService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loader.show();
    this.ccmDataService.getCountries().subscribe(res => {
      this.countries = res;
      this.fetchITMSData();
    });
  }

  private fetchITMSData(): void {
    this.itmsDataService.getITMSData('').subscribe((response: any[]) => {
      this.loader.hide();
      this.responseData = response;
      this.prepareData(response);
      this.prepareEditForm();
    });
  }

  private prepareEditForm(): void {
    this.editFormArray.clear();
    this.responseData.forEach((value, index) => {
      const formGroup = new FormGroup({
        countryCode: new FormControl(value.countryCode),
        countryName: new FormControl(value.countryName),
        display: new FormControl(value.display),
        isNew: new FormControl(value.isNew)
      });
      this.editFormArray.push(formGroup);
    });
  }

  public prepareData(response: any[]): void {
    console.log(response);
    const countriesWithoutData = this.countries.filter(
      x => response.findIndex(r => x.countryCode === r.countryCode) == -1
    );

    this.originalResponseData = [
      ...response,
      ...countriesWithoutData.map(x => {
        return {
          countryCode: x.countryCode,
          countryName: x.countryName,
          isNew: true,
          display: false
        };
      })
    ];

    this.responseData = this.originalResponseData;
  }

  ngAfterViewInit(): void {
    this.countryForm.controls['selectedCountry'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        /** Filtering the fetched deadlines based on selected country */
        if (v && v.countryCode && v.countryName) {
          this.selectedKey = v.countryCode;
          this.responseData = this.originalResponseData.filter(
            x => x.countryCode === v.countryCode
          );
          this.responseData = [...this.responseData];
        } else {
          this.selectedKey = '';
          this.responseData = this.originalResponseData;
          this.responseData = [...this.responseData];
        }
        this.prepareEditForm();
      });
  }

  public toggleDisplay(editItem, formControl: FormControl): void {
    editItem.display = !editItem.display;
    formControl.setValue(editItem.display);
    formControl.markAsDirty();
  }

  public submitForm() {
    const isDirty = this.editFormArray.dirty;
    console.log(isDirty);
    if (isDirty) {
      let updatedValues = [];
      const currentlyLoggedInUserInfoKeyCloak =
        Utils.currentlyLoggedInUserInfoKeyCloak;

      this.editFormArray.controls.forEach(c => {
        c.dirty ? updatedValues.push({ ...c.value }) : '';
      });
      if (
        currentlyLoggedInUserInfoKeyCloak.userClaims &&
        currentlyLoggedInUserInfoKeyCloak.userClaims.email
      ) {
        let sendObj = {
          data: updatedValues,
          updatedBy: currentlyLoggedInUserInfoKeyCloak.userClaims.email
        };
        this.loader.show();
        this.itmsDataService.saveITMSData(sendObj).subscribe((res: any) => {
          this.loader.hide();
          this.fetchITMSData();
          this.isEditEnabled = false;
          console.log(res);
        });
      }
    }
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
}
