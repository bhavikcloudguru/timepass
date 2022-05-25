import { CustomTabSelectorDirective } from './custom-tab-selector.directive';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgControl } from '@angular/forms';

describe('CustomTabSelectorDirective', () => {
  it('should create an instance', () => {
    let autoTrigger: MatAutocompleteTrigger;
    let ngControl: NgControl;
    const directive = new CustomTabSelectorDirective(autoTrigger, ngControl);
    expect(directive).toBeTruthy();
  });
});
