import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utils } from 'src/app/common/utilities/Utils';

@Component({
  selector: 'app-notification-panel-header',
  templateUrl: './notification-panel-header.component.html',
  styleUrls: ['./notification-panel-header.component.scss']
})
export class NotificationPanelHeaderComponent implements OnInit {
  private _bookingDetails: any = {};
  public isRead = false;
  @Input() public set bookingDetails(obj) {
    this._bookingDetails = obj;
    const ubn = this._bookingDetails.userBookingsNotifications.filter(
      ubn =>
        ubn.id.emailId.toLowerCase() ===
        Utils.currentlyLoggedInUserInfoKeyCloak.userClaims.email.toLowerCase()
    )[0];
    this.isRead = ubn.read;

    this._bookingDetails.creationTime &&
      (this._bookingDetails.creationTimeLocale = new Date(
        Date.parse(this._bookingDetails.creationTime + 'Z')
      ));
  }
  public get bookingDetails(): any {
    return this._bookingDetails;
  }
  @Input() isCapacityManager: boolean;
  @Output() actionTaken = new EventEmitter<{
    status: string;
    item: any;
    event: any;
  }>();
  public showPanel = false;
  constructor() {}

  ngOnInit(): void {}

  public getUrl(status: string): string {
    // TODO check for enabled and disabled
    let isEnabled = 'enabled';
    if (
      'SUBMITTED' === status.toUpperCase() ||
      'PROCESSING' === status.toUpperCase()
    ) {
      return '/assets/icons/new-booking/' + isEnabled + '/new-booking.png';
    } else if ('ACCEPTED' === status.toUpperCase()) {
      return (
        '/assets/icons/booking-accepted/' + isEnabled + '/booking-accepted.png'
      );
    } else if (
      'REJECTED' === status.toUpperCase() ||
      'CANCELLED' === status.toUpperCase()
    ) {
      return (
        '/assets/icons/booking-rejected/' + isEnabled + '/booking-rejected.png'
      );
    } else if ('PARTIAL_ACCEPTANCE' === status.toUpperCase()) {
      return (
        '/assets/icons/booking-partial-accepted/' +
        isEnabled +
        '/booking-partial-accepted.png'
      );
    }
    return '';
  }
  getUrlOOG() {
    let isOog = this.bookingDetails.cargo.filter(c => c.oog).length > 0;
    if (isOog) {
      return '/assets/icons/oog/present-header/oog.png';
    } else {
      return '/assets/icons/oog/absent/oog.png';
    }
  }
  getUrlHAZ() {
    let isOog = this.bookingDetails.cargo.filter(c => c.haz).length > 0;
    if (isOog) {
      return '/assets/icons/haz/present-header/haz.png';
    } else {
      return '/assets/icons/haz/absent/haz.png';
    }
  }

  getRF() {
    let isRf =
      this.bookingDetails.cargo.filter(c => c.equipType === 'RF').length > 0;
    return isRf;
  }
}
