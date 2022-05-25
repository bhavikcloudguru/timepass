import { Component, OnInit, ElementRef, Inject, Input } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig
} from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-free-time-cut-off-time-popup',
  templateUrl: './free-time-cut-off-time-popup.component.html',
  styleUrls: ['./free-time-cut-off-time-popup.component.scss']
})
export class FreeTimeCutOffTimePopupComponent implements OnInit {
  /* private readonly _matDialogRef: MatDialogRef<
    FreeTimeCutOffTimePopupComponent
  >;*/
  // private readonly triggerElementRef: any;
  @Input() public freeTimeCutOffTime = [];
  @Input() public showLoader;
  constructor /*_matDialogRef: MatDialogRef<FreeTimeCutOffTimePopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      trigger: ElementRef;
      portCode: string;
      data$: Observable<any>;
    }*/() {
    //  this._matDialogRef = _matDialogRef;
    //  this.triggerElementRef = data.trigger;
  }

  ngOnInit() {
    /*this.data.data$.subscribe(s => {
      this.freeTimeCutOffTime = s;
    });*/
    // const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    /*const rect = {
      left: this.triggerElementRef.x,
      top: this.triggerElementRef.y
    };
    matDialogConfig.position = {
      left: `${rect.left}px`,
      top: `${rect.top + 10}px`
    };*/
    /*  matDialogConfig.width = '300px';
     matDialogConfig.height = '200px';
    this._matDialogRef.updateSize(
      matDialogConfig.width,
      matDialogConfig.height
    );*/
    // this._matDialogRef.updatePosition(matDialogConfig.position);
  }
  cancel(): void {
    // this._matDialogRef.close(null);
  }
  getNotes() {
    let notes = '';
    this.freeTimeCutOffTime.forEach(n => (notes = notes + n.notes + ' '));
    return notes.trim();
  }
}
