import { Directive, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ClearInputDirective } from './clear-input.directive';

@Directive({
  selector: '[appAllowOnlyNumber]'
})
export class AllowOnlyNumberDirective {
  constructor(
    @Optional() private clearInputDirective: ClearInputDirective,
    @Optional() private ngControl: NgControl
  ) {}

  @HostListener('keydown', ['$event']) validateKeyDown(event): boolean {
    const code = event.keyCode ? event.keyCode : event.charCode;
    // console.log('event', event);
    if (
      // char
      !isNaN(Number(event.key)) ||
      // ctrl-a/c/v/x/y/z // backspace, tab, enter, home, end arrow left/right, insert, delete
      (event.ctrlKey &&
        [65, 67, 86, 88, 89, 90, 97, 99, 118, 120, 121, 122].indexOf(code) !==
          -1) ||
      [8, 9, 13, 35, 36, 37, 39, 45, 46].indexOf(code) !== -1
    ) {
      // debugger;
      if (this.clearInputDirective && this.ngControl) {
        this.clearInputDirective.clearInput(code);
      }
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
}
