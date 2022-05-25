import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConstants } from '../../app-constants/app-constants.model';
import { DataService } from 'src/app/data.service';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Output() registerUser = new EventEmitter();
  public userFeedback;
  public feedbackSubmit = false;
  public showLoading = false;
  public searchData: any;
  public lineCount = '125';
  public lNumber;
  public checkLineHeight = true;
  constructor(
    private dialogRef: MatDialogRef<FeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dataService: DataService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  ngOnInit(): void {
    if (this.data.searchData) {
      this.searchData = this.mapToData(this.data.searchData);
    }
  }

  public changeElm() {
    const elm = document.getElementById('wrap-element');
    const lineHeight = 24;
    if (elm.offsetHeight < window.innerHeight) {
      this.checkLineHeight = true;
      const txtElm = document.getElementById(
        'feedback-text'
      ) as HTMLTextAreaElement;
      const value = txtElm.value;
      const lineNumber = txtElm.offsetHeight / lineHeight;
      this.lNumber = (Math.floor(lineNumber) + 1).toString();
    } else {
      this.lineCount = this.lNumber;
    }
  }

  close() {
    this.dialogRef.close();
  }

  public mapToData(value): any {
    const params = {
      origin: value.originPort.portName + ', ' + value.originPort.countryName,
      departureDate: this.dateAdapter.format(value.departureDate, 'input'),
      destination:
        value.destinationPort.portName +
        ', ' +
        value.destinationPort.countryName,
      arrivalDate: this.dateAdapter.format(value.arrivalDate, 'input'),
      maxTransshipment: value.maxTrans
    };
    return params;
  }
  onSubmit() {
    const emailSubject =
      this.data.type === AppConstants.FEEDBACK_GENERAL_TYPE
        ? AppConstants.FEEDBACK_SUBJECT_GENERAL
        : AppConstants.FEEDBACK_SUBJECT_RESULT;
    this.showLoading = true;
    const feedbackData = {
      username: this.data.username,
      email: this.data.emailId,
      type: this.data.type,
      subject: emailSubject,
      feedback: this.userFeedback,
      additionalInfo: this.searchData
    };
    console.log(feedbackData);
    this.dataService.sendFeedbackEmail(feedbackData).subscribe(res => {
      if (res.status === true) {
        this.feedbackSubmit = true;
      }
      this.showLoading = false;
    });
  }
}
