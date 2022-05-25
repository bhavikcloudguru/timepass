import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-carbon-options',
  templateUrl: './carbon-options.component.html',
  styleUrls: ['./carbon-options.component.scss']
})
export class CarbonOptionsComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<CarbonOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  close(info?: string) {
    this.dialogRef.close(info);
  }
}
