import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-new-dl',
  templateUrl: './add-new-dl.component.html',
  styleUrls: ['./add-new-dl.component.scss']
})
export class AddNewDlComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<AddNewDlComponent>) {}

  ngOnInit(): void {}

  public newDl: string = '';
  public close() {
    this.dialogRef.close();
  }
  public closeNsend() {
    this.dialogRef.close(this.newDl);
  }
}
