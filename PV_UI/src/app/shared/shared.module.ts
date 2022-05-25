import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { LeftNavComponent } from './left-nav/left-nav.component';
import { RightNavComponent } from './right-nav/right-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { HighlightPipe } from '../common/highlight-pipe';
import { CustomTabSelectorDirective } from './../directives/custom-tab-selector.directive';
import { AllowOnlyCharactersDirective } from '../directives/allow-only-characters.directive';
import { ClearInputDirective } from '../directives/clear-input.directive';
import { RestrictUserInputDirective } from '../directives/restrict-user-input.directive';
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { MaterialModule } from '../product-schedule/material/material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TrafficStatusComponent } from './components/traffic-status/traffic-status.component';
import { CapacityStatusReadonlyComponent } from './components/capacity-status-readonly/capacity-status-readonly.component';
import { LoaderComponent } from './components/loader/loader.component';
import { AllowAccessDirective } from './directives/allow-access.directive';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NumbersOnlyDirective } from './directives/numbers-only/numbers-only.directive';
import { RegisterComponent } from './components/register/register.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { AllowOnlyNumberDirective } from '../directives/allow-only-number.directive';
import { AutocompleteCountryComponent } from './components/autocomplete-country/autocomplete-country.component';
import { CapacityStatusComponent } from './components/capacity-status/capacity-status.component';
import { CargoRestrictionComponent } from './components/cargo-restriction/cargo-restriction.component';
import { SortByComponent } from './components/sort-by/sort-by.component';
import { HighlightsPipe } from './directives/highlights/highlights.pipe';
import { BookingAcceptanceComponent } from './components/booking-acceptance/booking-acceptance.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { CarbonOptionsComponent } from './components/carbon-options/carbon-options.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';
import { AutocompleteFlagComponent } from './components/autocomplete-flag/autocomplete-flag.component';
import { RangeSliderComponent } from './components/range-slider/range-slider.component';
import { SwireButtonDirective } from './directives/swire-button/swire-button.directive';
import { PmIconComponent } from './components/pm-icon/pm-icon.component';
import { DropdownInputComponent } from './components/dropdown-input/dropdown-input.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FilterItemPipe } from './pipes/filter-item/filter-item.pipe';
import { GenericFilterComponent } from './components/generic-filter/generic-filter.component';
import { GenericFilterComponentWithGroupingComponent } from './components/generic-filter-component-with-grouping/generic-filter-component-with-grouping.component';
import { OptionFilterComponent } from './components/option-filter/option-filter.component';
import { MaxLengthPipe } from './pipes/max-length/max-length.pipe';
import { GroupFilterComponent } from './components/group-filter/group-filter.component';
import { DecimalNumberDirective } from './directives/decimal-number/decimal-number.directive';
import { InvalidRolesComponent } from './components/invalid-roles/invalid-roles.component';
import { CustomKeycloakAuthGuard } from './route-guards/custom-keycloak-authguard';
import { FindObjectIfDirective } from './directives/find-object/find-object-if.directive';
import { MaskDirective } from './directives/mask/mask.directive';
import { CheckboxDropdownComponent } from './components/checkbox-dropdown/checkbox-dropdown.component';
import { CheckboxAutocompleteComponent } from './components/checkbox-autocomplete/checkbox-autocomplete.component';
import { DropdownOptionComponent } from './components/dropdown-option/dropdown-option.component';
import { SlideToggleBoxComponent } from './components/slide-toggle-box/slide-toggle-box.component';

const componentsToImportNExport = [
  LeftNavComponent,
  RightNavComponent,
  HighlightPipe,
  CustomTabSelectorDirective,
  AllowOnlyCharactersDirective,
  ClearInputDirective,
  RestrictUserInputDirective,
  DialogPopupComponent,
  TrafficStatusComponent,
  CapacityStatusReadonlyComponent,
  LoaderComponent,
  AllowAccessDirective,
  NoAccessComponent,
  NumbersOnlyDirective,
  RegisterComponent,
  FeedbackComponent,
  AllowOnlyNumberDirective,
  AutocompleteCountryComponent,
  CapacityStatusComponent,
  CargoRestrictionComponent,
  SortByComponent,
  HighlightsPipe,
  BookingAcceptanceComponent,
  ConfirmationComponent,
  CarbonOptionsComponent,
  TimePickerComponent,
  SlideToggleComponent,
  AutocompleteFlagComponent,
  RangeSliderComponent,
  SwireButtonDirective,
  PmIconComponent,
  DropdownInputComponent,
  FilterItemPipe,
  GenericFilterComponent,
  GenericFilterComponentWithGroupingComponent,
  OptionFilterComponent,
  MaxLengthPipe,
  GroupFilterComponent,
  DecimalNumberDirective,
  InvalidRolesComponent,
  FindObjectIfDirective,
  MaskDirective,
  CheckboxDropdownComponent,
  CheckboxAutocompleteComponent,
  DropdownOptionComponent,
  SlideToggleBoxComponent
];
const modulesToImportNExport = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  SharedRoutingModule,
  MatListModule,
  MatSidenavModule,
  LayoutModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MaterialModule,
  NgxDropzoneModule
];
@NgModule({
  declarations: componentsToImportNExport,
  imports: modulesToImportNExport,
  exports: [...modulesToImportNExport, ...componentsToImportNExport]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [CustomKeycloakAuthGuard]
    };
  }
}
