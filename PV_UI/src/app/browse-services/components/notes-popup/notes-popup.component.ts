import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-notes-popup',
  templateUrl: './notes-popup.component.html',
  styleUrls: ['./notes-popup.component.scss']
})
export class NotesPopupComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<NotesPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  public notes: string;
  public disabled = true;
  public initialNotes: any;
  ngOnInit(): void {
    this.notes = this.data.trafficData[0].notes;
    this.initialNotes = {
      notes: this.data.trafficData[0].notes
        ? this.data.trafficData[0].notes
        : ''
    };
  }

  public noteUpdates(event): void {
    if (this.notes.trim() === this.initialNotes.notes.trim()) {
      this.disabled = true;
      return;
    } else {
      this.disabled = this.initialNotes
        ? false
        : this.notes.length
        ? false
        : true;
    }
    // this.disabled = this.notes.length ? false : true;
  }

  public saveNotesData(): void {
    this.data.trafficData.forEach(el => {
      el.notes = this.notes;
    });
    this.dialogRef.close(this.data.trafficData);
  }

  public cancelPopup(): void {
    this.dialogRef.close();
  }
}
