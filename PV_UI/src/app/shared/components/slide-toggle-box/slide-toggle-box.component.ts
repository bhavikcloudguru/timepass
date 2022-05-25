import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-slide-toggle-box',
  templateUrl: './slide-toggle-box.component.html',
  styleUrls: ['./slide-toggle-box.component.scss']
})
export class SlideToggleBoxComponent implements OnInit {
  constructor() {}
  public selected = 'TEU'
  ngOnInit(): void {}

  public toggle() {
    this.selected = this.selected === 'TEU' ? 'MTON' : 'TEU';
    //this.toggleSlide.emit();
  }
}
