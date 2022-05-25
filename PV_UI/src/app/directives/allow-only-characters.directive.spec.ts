import { AllowOnlyCharactersDirective } from './allow-only-characters.directive';
import { ClearInputDirective } from './clear-input.directive';
import { NgControl } from '@angular/forms';

describe('AllowOnlyCharactersDirective', () => {
  it('should create an instance', () => {
    let clearInputDirective: ClearInputDirective;
    let ngControl: NgControl;

    const directive = new AllowOnlyCharactersDirective(
      clearInputDirective,
      ngControl
    );
    expect(directive).toBeTruthy();
  });
});
