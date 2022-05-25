import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-capacity-status-readonly',
  templateUrl: './capacity-status-readonly.component.html',
  styleUrls: ['./capacity-status-readonly.component.scss']
})
export class CapacityStatusReadonlyComponent implements OnInit {
  @Input() capacityStatus: string;
  @Input() size: string;
  @Input() notes: string;
  @Output() public bookingSubmit = new EventEmitter();
  public textMap = {
    green: 'OK to book',
    orange: 'Partial acceptance',
    red: 'Refer only'
  };
  constructor() {}

  ngOnInit(): void {}

  public submitBooking(): void {
    this.bookingSubmit.emit();
  }
}
