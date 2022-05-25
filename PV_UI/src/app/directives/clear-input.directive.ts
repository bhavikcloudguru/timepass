import { Directive, Optional, Self, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appClearInput]'
})
export class ClearInputDirective {
  constructor(@Optional() @Self() public ngControl: NgControl) {}

  public clearInput(keyCode: number): void {
    if (this.ngControl && this.ngControl.value.portCode) {
      if (
        // valid characters
        (keyCode > 64 && keyCode < 91) ||
        // SPACE
        keyCode === 32
      ) {
        this.ngControl.control.setValue('');
      }
    }
  }
  /* @HostListener('click', ['$event']) validateKeyDown(event): void {
    // const code = event.keyCode ? event.keyCode : event.charCode;
    // console.log('event', event);
    // this.clearInput(32);
  }*/
}
