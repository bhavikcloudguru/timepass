import { Directive, Optional, OnDestroy, HostListener } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCustomTabSelector]'
})
/**
 * This directive is used to used to handle the TAB key use case of MatAutoComplete
 */
export class CustomTabSelectorDirective {
  // private observable: Subscription;
  constructor(
    // the host element
    @Optional() private autoTrigger: MatAutocompleteTrigger,
    // the NgControl of formControl which is associated with the host controller.
    @Optional() private control: NgControl
  ) {}

  /** This will always select the active option even if you click outside (i.e. dont intend to select) */
  /* ngAfterViewInit() {
    this.observable = this.autoTrigger.panelClosingActions.subscribe((x) => {
      if (this.autoTrigger.activeOption) {
        const value = this.autoTrigger.activeOption.value;
        if (this.control) this.control.control.setValue(value, { emit: true });
        this.autoTrigger.writeValue(value);
      }
    });
  }
  ngOnDestroy() {
    this.observable.unsubscribe();
  }*/

  @HostListener('keydown.tab', ['$event.target']) onBlur() {
    if (this.autoTrigger.activeOption) {
      this.autoTrigger.writeValue(this.autoTrigger.activeOption.value);
      if (this.control) {
        this.control.control.setValue(this.autoTrigger.activeOption.value, {
          emit: true
        });
      }
    }
  }

  @HostListener('keydown.Enter', ['$event.target']) onBlurr() {
    if (this.autoTrigger.activeOption) {
      this.autoTrigger.autocomplete._keyManager.setActiveItem(null);
    }
  }
}
