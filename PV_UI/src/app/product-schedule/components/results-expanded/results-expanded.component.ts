import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import { MatTab } from '@angular/material/tabs';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/data.service';
import { Utils } from 'src/app/common/utilities/Utils';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../material/CustomDateAdapter';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { BookingAcceptanceComponent } from 'src/app/shared/components/booking-acceptance/booking-acceptance.component';

@Component({
  selector: 'app-results-expanded',
  templateUrl: './results-expanded.component.html',
  styleUrls: ['./results-expanded.component.scss']
})
export class ResultsExpandedComponent implements OnInit {
  @Input() portCode: string;
  @Input() vesselCode: string;
  @Input() voyageNumber: string;
  @Input() departureDate: string;
  @Input() capacityStatus: string;
  @Input() notes: string;
  @Input() details: any;
  @Input() portList: any;
  @Input() destinationPortCode: string;
  @Input() medianCo2: number;
  @Input() medianCo2Nz: any;
  @Input() medianCo2Total: number;
  @Input() cargoWt;
  @Input() cargoVolumeOption;
  @Output() sendFeedback = new EventEmitter();
  private _d: string;
  @Input() set direction(d: string) {
    if (d) {
      this._d = d.slice(d.length - 1, d.length);
    } else {
      this._d = '';
    }
  }
  get direction(): string {
    return this._d;
  }
  private dataOnceLoaded = false;
  constructor(
    private dataService: DataService,
    private dateAdapter: DateAdapter<Date>,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}
  public freeTimeCutOffTime = [];
  public showCutOffTimeLoader = false;
  ngOnInit(): void {}

  public tabChanged(event: { index: number; tab: MatTab }) {
    if (event.tab && event.tab.textLabel === 'Cut off times') {
      if (this.dataOnceLoaded) {
        return;
      }
      this.showCutOffTimeLoader = true;
      this.dataService
        .getFreeTimeCutOffTime({
          arrivalDate: this.departureDate,
          portName: this.portCode,
          vesselCode: this.vesselCode,
          voyageNumber: this.voyageNumber,
          todate: (this.dateAdapter as CustomDateAdapter).getToDate(
            this.departureDate
          ),
          fromdate: (this.dateAdapter as CustomDateAdapter).getFromDate(
            this.departureDate
          ),
          direction: this.direction
        })
        .subscribe(s => {
          this.freeTimeCutOffTime = s;
          this.showCutOffTimeLoader = false;
          this.dataOnceLoaded = true;
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  public onSubmit(event): void {
    const dialogRef: MatDialogRef<BookingAcceptanceComponent> = this.dialog.open(
      BookingAcceptanceComponent,
      {
        width: '1084px',
        data: {
          portCode: this.portCode,
          departureDate: this.departureDate,
          details: this.details,
          portList: this.portList,
          pod: '' //this.destinationPortCode
        },
        scrollStrategy: new NoopScrollStrategy()
      }
    );
    dialogRef.afterClosed().subscribe(result => {});
  }
}
