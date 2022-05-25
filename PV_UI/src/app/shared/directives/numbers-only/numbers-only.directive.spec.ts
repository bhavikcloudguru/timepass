import { NumbersOnlyDirective } from './numbers-only.directive';
import { ElementRef } from '@angular/core';

describe('NumbersOnlyDirective', () => {
  it('should create an instance', () => {
    let elmRef: ElementRef;
    const directive = new NumbersOnlyDirective(elmRef);
    expect(directive).toBeTruthy();
  });
});
