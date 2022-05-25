import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() registerUser = new EventEmitter();
  constructor(
    private dialogRef: MatDialogRef<RegisterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data.deparments = [];
    data.designations = [];
    data.locations = [];
    data.groups$.subscribe(g => {
      this.data.groups = g;
    });
    data.designations$.subscribe(d => {
      this.data.designations = d;
    });

    data.location$.subscribe(location => {
      const uniqCity = [];
      location.forEach(l => {
        uniqCity.indexOf(l) === -1 ? uniqCity.push(l) : true;
      });
      data.locations = uniqCity.sort();
    });
  }

  ngOnInit(): void {}

  close(info?: string) {
    this.dialogRef.close(info);
  }
  onSubmit(v) {
    console.log('OnSubmit clicked.', v);
    this.registerUser.emit(v);
    this.dialogRef.close();
  }
  compareDept(optionOne, optionTwo): boolean {
    return (optionOne && optionOne.id) === (optionTwo && optionTwo.id);
  }
}
