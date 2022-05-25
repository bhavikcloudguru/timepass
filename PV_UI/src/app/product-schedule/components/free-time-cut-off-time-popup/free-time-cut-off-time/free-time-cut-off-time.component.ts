import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-free-time-cut-off-time',
  templateUrl: './free-time-cut-off-time.component.html',
  styleUrls: ['./free-time-cut-off-time.component.scss']
})
export class FreeTimeCutOffTimeComponent implements OnInit {
  @Input() public freeTime;
  @Input() public cutOffTime;
  constructor() {}

  ngOnInit(): void {}
}
