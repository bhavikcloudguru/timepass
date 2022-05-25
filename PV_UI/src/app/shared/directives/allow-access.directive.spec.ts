import { AllowAccessDirective } from './allow-access.directive';
import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

describe('AllowAccessDirective', () => {
  it('should create an instance', () => {
    let containerRef: ViewContainerRef;
    let cfresolver: ComponentFactoryResolver;
    const directive = new AllowAccessDirective(containerRef, cfresolver);
    expect(directive).toBeTruthy();
  });
});
