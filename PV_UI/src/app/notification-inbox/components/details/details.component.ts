import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/common/utilities/Utils';
import { DataService } from 'src/app/data.service';
import { EventDispatcherService } from 'src/app/shared/api-service/event-dispatcher/event-dispatcher.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { BookingAcceptanceComponent } from 'src/app/shared/components/booking-acceptance/booking-acceptance.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  public bookingId;
  public bookingDetails;
  public isReadOnly = false;
  public isAccessDenied = false;
  public readonly dateFormat = 'dd LLL yyyy';
  private subscriptions: Subscription = new Subscription();
  public userClaims;
  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public dataService: DataService,
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public loaderService: LoaderService
  ) {
    this.bookingId = activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      EventDispatcherService.getObservable(
        EventDispatcherService.ON_GET_USER_DETALS
      ).subscribe(v => {
        if (v) {
          this.initializeDetails();
          this.ticketMarkAsRead();
        }
      })
    );

    //   this.ticketMarkAsRead();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public initializeDetails(): void {
    const bId = new Array(this.bookingId);
    this.dataService.getBookingDetails(bId).subscribe(
      result => {
        this.bookingDetails = result[0];
        this.loaderService.hide();
      },
      error => {}
    );
  }

  public ticketMarkAsRead(): void {
    this.userClaims = Utils.currentlyLoggedInUserInfoKeyCloak.userClaims;
    if (this.userClaims && this.userClaims.email) {
      this.dataService
        .markAsRead(this.bookingId, this.userClaims.email, true)
        .subscribe(
          result => {
            // result
          },
          error => {}
        );
    }
  }

  public navigateBack(url: string) {
    this.router.navigate([url]);
  }

  public openUpdateView(): void {
    const dialogRef: MatDialogRef<BookingAcceptanceComponent> = this.dialog.open(
      BookingAcceptanceComponent,
      {
        width: '1084px',
        data: {
          portCode: this.bookingDetails.portCode,
          departureDate: this.bookingDetails.departureDate,
          details: this.bookingDetails,
          portList: []
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      this.initializeDetails();
    });
  }

  public cancelRequest(): void {
    const dialogRef: MatDialogRef<ConfirmationComponent> = this.dialog.open(
      ConfirmationComponent,
      {
        width: '476px',
        data: {
          action: AppConstants.CANCEL
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'yes') {
        this.cancelBookingRequest();
      }
    });
  }

  public cancelBookingRequest(): void {
    this.loaderService.show();
    const statusJson = {
      emailId: this.userClaims.email,
      bookingId: this.bookingDetails.bookingId,
      acceptanceStatus: 'CANCELLED'
    };
    this.dataService.sendRequestStatus(statusJson).subscribe(
      result => {
        this.initializeDetails();
      },
      error => {}
    );
  }

  public submitRequest(status: string): void {
    const acceptanceStatus = status === 'approve' ? 'ACCEPTED' : 'REJECTED';
    this.openConfirmationView(status, acceptanceStatus);
  }

  public partialAcceptance(): void {
    const status = AppConstants.PARTIALLY_ACCEPT;
    const acceptanceStatus = AppConstants.PARTIAL_ACCEPTANCE_STATUS;
    this.openConfirmationView(status, acceptanceStatus);
  }

  public openConfirmationView(status: string, acceptanceStatus: string) {
    const dialogRef: MatDialogRef<ConfirmationComponent> = this.dialog.open(
      ConfirmationComponent,
      {
        width: '476px',
        data: {
          action: status,
          notes: this.bookingDetails?.acceptanceNotes
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'yes') {
        const statusJson = {
          emailId: this.userClaims.email,
          bookingId: this.bookingDetails.bookingId,
          acceptanceStatus: acceptanceStatus,
          notes: result.notes
        };
        this.loaderService.show();
        this.dataService.sendRequestStatus(statusJson).subscribe(response => {
          this.initializeDetails();
        });
      }
    });
  }

  public markAsReadOnly(readOnly: boolean) {
    // console.log('markAsReadOnly', readOnly);
    this.isReadOnly = readOnly;
    this.changeDetectorRef.detectChanges();
  }
  public markAsAccessDenied(accessDenied: boolean) {
    this.isAccessDenied = accessDenied;
    this.changeDetectorRef.detectChanges();
  }
}
