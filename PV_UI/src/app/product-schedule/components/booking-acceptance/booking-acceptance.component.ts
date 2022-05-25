import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/data.service';
import { Booking } from '../../models/Booking';
import { Utils } from 'src/app/common/utilities/Utils';

@Component({
  selector: 'app-booking-acceptance',
  templateUrl: './booking-acceptance.component.html',
  styleUrls: ['./booking-acceptance.component.scss']
})
export class BookingAcceptanceComponent implements OnInit {
  public booking = new Booking();
  public bookingId = '';
  public cargoDetails: any;
  public selectedGroup = 'container';
  public haz = false;
  public oog = false;
  public hazValue = false;
  public file: any;
  public image: any;
  public showLoader = false;
  constructor(
    private dialogRef: MatDialogRef<BookingAcceptanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dataService: DataService
  ) {}

  ngOnInit(): void {
    this.booking.portCode = this.data.portCode;
    const portList = this.booking.uniquePortList(this.data.portList);
    this.booking.setData(this.data.details, portList, this.data.pod);
    this.setEmailId();
    this.dataService.getCargoDetails().subscribe(
      result => {
        this.cargoDetails = result;
      },
      error => {}
    );
  }

  public setEmailId(): void {
    const userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (userClaims && userClaims.email) {
      this.booking.fromEmail = userClaims.email;
    }
  }

  public toggleHazValue(): void {
    this.haz = !this.haz;
  }

  public toggleOogValue(): void {
    this.oog = !this.oog;
  }

  public onFileSelect(event): void {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }

  public onImageSelect(event): void {
    if (event.target.files.length > 0) {
      this.image = event.target.files[0];
    }
  }

  onSubmit() {
    this.showLoader = true;
    this.booking.bulk = this.selectedGroup === 'bb' ? true : false;
    this.booking.container = this.selectedGroup === 'container' ? true : false;
    console.log(this.booking.toJson());
    const fData = this.booking.setFormData(
      this.booking.toJson(),
      this.file,
      this.image
    );
    this.dataService.postEmailServiceData(fData).subscribe(result => {
      console.log(result);
      this.showLoader = false;
      this.bookingId = result.bookingId;
      // this.dialogRef.close();
    });
  }

  public cancelPopup(): void {
    this.dialogRef.close();
  }

  public selectChange(): void {
    setTimeout(() => document.getElementById('shipper').focus());
  }
}
