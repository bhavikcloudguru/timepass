import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit {
  @Input()
  region: any;
  @Input()
  type: string;
  @Input()
  selected: any;
  @Output() public selectItem = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {}
  public selectCountry(_c: any, index: any): void {
    _c.index = index + 1;
    this.selectItem.emit({ _c, type: this.type });
  }
}
