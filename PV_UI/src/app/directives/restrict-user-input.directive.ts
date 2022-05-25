import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appRestrictUserInput]'
})
/**
 * This directive will restrict the user input
 * [User will not be able to enter anything in the input box]
 */
export class RestrictUserInputDirective {
  constructor() {}
  @HostListener('keydown', ['$event']) validatekeyPress(event): boolean {
    const code = event.keyCode ? event.keyCode : event.charCode;
    if (code === 9) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}
