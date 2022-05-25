import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { CustomDateAdapter, CUSTOM_FORMATS } from './CustomDateAdapter';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatRadioModule,
  MAT_RADIO_DEFAULT_OPTIONS
} from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

const modules = [
  MatFormFieldModule,
  MatInputModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatIconModule,
  HttpClientModule,
  MatSliderModule,
  MatSelectModule,
  MatExpansionModule,
  MatDividerModule,
  MatCheckboxModule,
  ScrollingModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatTabsModule,
  MatRadioModule,
  MatProgressBarModule,
  MatSlideToggleModule,
  MatTooltipModule
];
@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_FORMATS }
  ]
})
export class MaterialModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'cncoDatepickerIcon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        './../../../assets/icons/calendar.svg'
      )
    );
  }
}
