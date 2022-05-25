import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-pm-icon',
  templateUrl: './pm-icon.component.html',
  styleUrls: ['./pm-icon.component.scss']
})
export class PmIconComponent implements OnInit, OnChanges {
  @Input()
  name: string;
  @Input()
  disable;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {}
}
