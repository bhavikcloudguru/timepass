import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {
  @Input() hour: number = 0;
  @Input() minutes: number = 0;
  @Output() timeEmitted = new EventEmitter<{ hour: number; mins: number }>();
  constructor(
    private dialogRef: MatDialogRef<TimePickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.hour) {
      this.hour = parseInt(data.hour);
    }
    if (data.min) {
      this.minutes = parseInt(data.min);
    }
  }

  ngOnInit(): void {}
  public emit() {
    this.timeEmitted.emit({ hour: this.hour, mins: this.minutes });
  }
  public closePopup() {
    this.dialogRef.close();
  }
}
