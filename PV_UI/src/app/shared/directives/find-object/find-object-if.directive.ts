import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appFindIf]'
})
export class FindObjectIfDirective {
  @Input()
  set appFindIf(_arr: any) {
    this.container.clear();
    let index = _arr.findIndex(_i => _i.isSelected);
    index > -1
      ? this.container.createEmbeddedView(this.templateRef)
      : this.container.clear();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private container: ViewContainerRef
  ) {}
}
