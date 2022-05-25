import { ClearInputDirective } from './clear-input.directive';
import { NgControl } from '@angular/forms';

describe('ClearInputDirective', () => {
  it('should create an instance', () => {
    let ngControl: NgControl;
    const directive = new ClearInputDirective(ngControl);
    expect(directive).toBeTruthy();
  });
});
