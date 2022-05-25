import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  public action: string;
  public notes;
  public isBulk;
  constructor(
    private dialogRef: MatDialogRef<ConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.action = data.action;
    this.notes = data.notes;
    this.isBulk = data.isBulk ? data.isBulk : false;
  }

  ngOnInit(): void {}

  close(info?: string) {
    this.dialogRef.close(info);
  }
  confirmRequest(v) {
    const confirmNotes = {
      action: v,
      notes: this.notes
    };
    this.dialogRef.close(confirmNotes);
  }
}
