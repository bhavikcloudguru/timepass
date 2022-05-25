import { NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

import { Injectable } from '@angular/core';
import { Utils } from 'src/app/common/utilities/Utils';

export const CUSTOM_FORMATS = {
  parse: { dateInput: { month: 'long', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: any): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'yyyy-MM-dd', this.locale);
    } else if (displayFormat === 'full-view') {
      return formatDate(date, 'LL/dd/yyyy HH:mm', this.locale);
    } else if (displayFormat === 'date-time-view') {
      return formatDate(date, 'yyyy-MM-dd HH:mm:ss', this.locale);
    } else {
      return date.toDateString();
    }
  }
  public getToDate(depDate) {
    const dDepDate = Date.parse(depDate);
    return this.format(new Date(dDepDate + Utils.oneDay * 30), 'input');
  }
  public getFromDate(depDate) {
    const dDepDate = Date.parse(depDate);
    return this.format(new Date(dDepDate - Utils.oneDay * 30), 'input');
  }
}
