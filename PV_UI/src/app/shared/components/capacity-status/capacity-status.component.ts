import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-capacity-status',
  templateUrl: './capacity-status.component.html',
  styleUrls: ['./capacity-status.component.scss']
})
export class CapacityStatusComponent implements OnInit {
  @Input() capacityStatus: string;
  @Input() size: string;
  public textMap = {
    green: 'OK to book',
    orange: 'Partial acceptance',
    red: 'Refer only'
  };
  constructor() {}

  ngOnInit(): void {}
}
