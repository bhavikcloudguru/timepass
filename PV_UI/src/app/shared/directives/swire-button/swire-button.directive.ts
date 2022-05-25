import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appButton]'
})
export class SwireButtonDirective implements OnInit, OnChanges {
  @Input()
  appButton;

  @Input()
  disable: boolean;
  @HostBinding('class')
  elementClass = 'btn-main-view';
  constructor(private renderer: Renderer2, public hostElement: ElementRef) {}

  ngOnInit() {
    this.doReadOnly();
  }

  ngOnChanges() {
    this.doReadOnly();
  }

  doReadOnly() {
    this.hostElement.nativeElement.disabled = this.disable;
    this.resetClass();
    //this.setDisableToChild();
    if (this.appButton === 'fill') {
      this.setFillView();
    }
    if (this.disable) {
      this.renderer.addClass(this.hostElement.nativeElement, 'btn-disabled');
    } else {
      this.renderer.addClass(this.hostElement.nativeElement, 'btn-outline');
    }
  }

  public setFillView() {
    if (this.disable) {
      this.renderer.addClass(this.hostElement.nativeElement, 'btn-disabled');
    } else {
      this.renderer.addClass(this.hostElement.nativeElement, 'btn-fill');
    }
  }

  setDisableToChild() {
    const elements = this.hostElement.nativeElement.querySelector(
      'app-pm-icon'
    );
    this.renderer.setAttribute(elements, 'ng-reflect-disable', 'true');
  }
  public resetClass() {
    this.renderer.removeClass(this.hostElement.nativeElement, 'btn-outline');
    this.renderer.removeClass(this.hostElement.nativeElement, 'btn-disabled');
  }
}
