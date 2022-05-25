import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-default-popup',
  templateUrl: './default-popup.component.html',
  styleUrls: ['./default-popup.component.scss']
})
export class DefaultPopupComponent implements OnInit {
  public message: string;
  constructor(
    private dialogRef: MatDialogRef<DefaultPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.message = data.message;
  }

  ngOnInit(): void {}

  cancel(info?: string) {
    this.dialogRef.close(info);
  }
  confirm(v) {
    this.dialogRef.close(v);
  }
}
