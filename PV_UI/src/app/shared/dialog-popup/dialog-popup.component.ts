import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Inject,
  ViewChild
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatInput } from '@angular/material/input';
@Component({
  selector: 'app-dialog-popup',
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.scss']
})
export class DialogPopupComponent implements OnInit {
  @Output() exportClicked = new EventEmitter<any>();
  // form variables used for checkboxes showed inside popup
  formGroup: FormGroup;
  @ViewChild('emailId') emailInput: MatInput;

  constructor(
    private dialogRef: MatDialogRef<DialogPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    const minValue = this.data.comp === 'browse-service' ? 1 : 0;
    this.formGroup = this.formBuilder.group({
      firstGroup: new FormGroup({}, this.minSelectedCheckboxes(1)),
      secondGroup: new FormGroup({}, this.minSelectedCheckboxes(minValue)),
      recipient: new FormGroup({})
    });
    this.addCheckboxes();
  }

  private addEmailFormControl(): void {
    (this.formGroup.controls.recipient as FormGroup).addControl(
      'to',
      new FormControl('', [Validators.email])
    );
    (this.formGroup.controls.recipient as FormGroup).addControl(
      'subject',
      new FormControl('')
    );
    (this.formGroup.controls.recipient as FormGroup).addControl(
      'message',
      new FormControl('')
    );
    setTimeout(() => {
      this.emailInput.focus();
    }, 1);
  }

  private removeEmailFormControl(): void {
    (this.formGroup.controls.recipient as FormGroup).removeControl('to');
    (this.formGroup.controls.recipient as FormGroup).removeControl('subject');
    (this.formGroup.controls.recipient as FormGroup).removeControl('message');
  }

  public onCheckSendEmail(checked, value): void {
    if (value !== '2__Send as email') {
      return;
    }
    checked ? this.addEmailFormControl() : this.removeEmailFormControl();
  }

  /**
   * Create checkboxes based on the sent data.
   */
  private addCheckboxes() {
    this.data.firstGroupData.forEach((o, i) => {
      const control = new FormControl({
        value: o.checked,
        disabled: o.disabled
      });

      (this.formGroup.controls.firstGroup as FormGroup).addControl(
        o.order + '__' + o.label,
        control
      );
    });
    this.data.secondGroupData.forEach((o, i) => {
      const control = new FormControl({
        value: o.checked,
        disabled: o.disabled
      });
      (this.formGroup.controls.secondGroup as FormGroup).addControl(
        o.order + '__' + o.label,
        control
      );
    });
  }
  /**
   *
   * @param min validates so that atleast one checkbox should be selected from group
   */
  minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formGroup: FormGroup) => {
      const totalSelected = Object.keys(formGroup.controls)
        // get a list of checkbox values (boolean)
        .map(key => formGroup.controls[key].value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => (next ? prev + next : prev), 0);

      // if the total is not greater than the minimum, return the error message
      return totalSelected >= min ? null : { required: true };
    };

    return validator;
  }

  ngOnInit(): void {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  asFormGroup(v): FormGroup {
    return v;
  }
  exportData(): any {
    const selectedFilters = {};
    Object.keys(this.formGroup.controls.firstGroup.value).forEach(key => {
      this.data.firstGroupData.forEach(o => {
        if (
          key.indexOf(o.label) > -1 &&
          this.formGroup.controls.firstGroup.value[key]
        ) {
          selectedFilters[o.key] = true;
        }
      });
    });
    Object.keys(this.formGroup.controls.secondGroup.value).forEach(key => {
      this.data.secondGroupData.forEach(o => {
        if (
          key.indexOf(o.label) > -1 &&
          this.formGroup.controls.secondGroup.value[key]
        ) {
          selectedFilters[o.key] = true;
        }
      });
    });
    console.log(selectedFilters);
    console.log(this.formGroup.controls.recipient.value);
    selectedFilters['selectedResults'] = true;
    this.exportClicked.emit({
      selectedFilters,
      recipient: this.formGroup.controls.recipient.value
    });
  }
}
