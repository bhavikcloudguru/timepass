import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-notification-panel-body',
  templateUrl: './notification-panel-body.component.html',
  styleUrls: ['./notification-panel-body.component.scss']
})
export class NotificationPanelBodyComponent implements OnInit {
  constructor() {}

  @Input() public bookingDetails;
  @Input() public isCapacityManager: boolean;
  @Output() public actionTaken = new EventEmitter<{
    status: string;
    item: any;
    comments: string;
  }>();
  @Output() public updateBooking = new EventEmitter<any>();
  public comments: string = '';
  ngOnInit(): void {}

  public emitEvent(status) {
    this.actionTaken.emit({
      status,
      item: this.bookingDetails,
      comments: this.comments
    });
  }
  public getLocaleTime(time: any): Date {
    return new Date(Date.parse(time + 'Z'));
  }
}
