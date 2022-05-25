import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { BookingAcceptanceComponent } from 'src/app/shared/components/booking-acceptance/booking-acceptance.component';
@Component({
  selector: 'app-expanded-view',
  templateUrl: './expanded-view.component.html',
  styleUrls: ['./expanded-view.component.scss']
})
export class ExpandedViewComponent implements OnInit {
  @Input() details: any;
  @Input() portCode: string;
  @Input() portName: string;
  @Input() countryCode: string;
  @Input() countryName: string;
  public cutOffTime;
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.cutOffTime =
      this.details && this.details.freeCutoff ? this.details.freeCutoff : [];
  }

  public submitBooking(): void {
    const bookingData = {
      countryName: this.countryName,
      portCode: this.portCode,
      portDepartureInfo: this.details.estDeparture,
      portName: this.portName,
      portNameInfo: this.portName,
      service: this.details.serviceCode,
      serviceCode: this.details.serviceCode,
      trafficStatus: this.details.capacityStatus,
      notes: this.details.remarks,
      vessel: this.details.vessel,
      vesselCode: this.details.vessel,
      voyageNumber: this.details.voyageNumber + this.details.leg
    };
    const splitDate =
      this.details && this.details.estDeparture
        ? this.details.estDeparture.split(' ')
        : '';
    const depDate = splitDate && splitDate.length ? splitDate[0] : '';
    const dialogRef: MatDialogRef<BookingAcceptanceComponent> = this.dialog.open(
      BookingAcceptanceComponent,
      {
        width: '1084px',
        data: {
          portCode: this.portCode,
          departureDate: depDate,
          details: bookingData,
          portList: [],
          pod: '' //this.details.nextPortCode
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {});
  }
}
