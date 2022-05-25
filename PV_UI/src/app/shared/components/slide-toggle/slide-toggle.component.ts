import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss']
})
export class SlideToggleComponent implements OnInit {
  constructor() {}
  @Input() isEditAccessible;
  @Input() isEditEnabled;
  @Output() public toggleSlide = new EventEmitter<any>();
  ngOnInit(): void {}

  public toggle() {
    console.log('event');
    this.toggleSlide.emit();
  }
}
