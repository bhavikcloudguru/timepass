import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Optional
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]'
})
export class MaskDirective {
  notApplied: boolean = false;
  private _oldvalue: string = '';
  private regExpr: any = new RegExp(/^[A-Z|a-z|0-9]+$/);
  @Input()
  set mask(value) {
    if (value == '*') this.notApplied = true;
    else this.regExpr = new RegExp(value);
  }

  constructor(@Optional() private control: NgControl) {}
  @HostListener('input', ['$event'])
  change($event) {
    if (this.notApplied) return;
    let item = $event.target;
    let value = item.value;
    let pos = item.selectionStart;
    let matchvalue = value;
    let noMatch: boolean = value && !this.regExpr.test(matchvalue);
    if (noMatch) {
      item.selectionStart = item.selectionEnd = pos - 1;
      if (item.value.length < this._oldvalue.length && pos == 0) pos = 2;
      if (this.control)
        this.control.control.setValue(this._oldvalue, { emit: false });

      item.value = this._oldvalue;
      item.selectionStart = item.selectionEnd = pos - 1;
    } else this._oldvalue = value;
  }
}
