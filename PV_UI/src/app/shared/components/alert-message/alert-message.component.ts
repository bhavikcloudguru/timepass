import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertMessageComponent implements OnInit {
  public message: string;
  constructor(
    private dialogRef: MatDialogRef<AlertMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.message = data.message;
  }

  ngOnInit(): void {}

  close(info?: string) {
    this.dialogRef.close(info);
  }
  confirmRequest(v) {
    this.dialogRef.close(v);
  }
}
