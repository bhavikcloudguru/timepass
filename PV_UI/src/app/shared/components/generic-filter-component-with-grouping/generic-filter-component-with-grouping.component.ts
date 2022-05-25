import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-filter-component-with-grouping',
  templateUrl: './generic-filter-component-with-grouping.component.html',
  styleUrls: ['./generic-filter-component-with-grouping.component.scss']
})
export class GenericFilterComponentWithGroupingComponent implements OnInit {
  public isAllSelected = false;
  private _values = [] as any[];
  @Input() public selectDisplayString: string;
  @Input() public selectedDisplayString: string;
  @Input() public allSelectedString: string;
  @Input() public key: string;
  @Input() public displayName: string;
  @Input() public initialFilterValue: any[] = [];
  @Input() public set values(value: any[]) {
    Object.keys(value).forEach(key => {
      value[key].forEach(k => {
        this._values[key] = this._values[key] ? this._values[key] : [];
        this._values[key].push(k);
      });
    });
    console.log('values', this._values);
  }
  public get values() {
    return this._values;
  }
  public selectedServices = [];
  @Output() selectedServiceChange = new EventEmitter<any>();
  constructor() {}
  ngAfterViewInit(): void {
    if (this.initialFilterValue.length === 0) {
      this.selectService('', true);
    } else {
      this.initialFilterValue.forEach(v => {
        this.selectService(v, true);
      });
    }
  }

  ngOnInit(): void {}
  public selectService(value: any, emit?: boolean) {
    if (value) {
      // select/deselect one value.
      if (this.selectedServices.indexOf(value) === -1) {
        this.selectedServices.push(value);
      } else {
        this.selectedServices = this.selectedServices.filter(x => x !== value);
      }
    } else {
      // select deselect all
      const allValues = Object.keys(this.values).flatMap(r => [
        ...this.values[r]
      ]);
      console.log('allvalues', allValues);
      if (this.selectedServices.length !== allValues.length) {
        this.selectedServices = [];

        allValues.forEach(s => this.selectedServices.push(s[this.key]));
      } else {
        this.selectedServices = [];
      }
    }
    this.selectedServices = [...this.selectedServices];
    if (emit) {
      this.selectedServiceChange.emit(this.selectedServices);
    }
  }
  public selectGroup(groupName: any, emit?: boolean): void {
    const allValues: any[] = this.values[groupName];

    const isAllSelected = this.isChecked(groupName);
    if (isAllSelected) {
      // remove
      this.selectedServices = this.selectedServices.filter(
        s => allValues.map(a => a[this.key]).indexOf(s) === -1
      );
    } else {
      // add unselected items from group
      this.selectedServices.push(
        ...allValues
          .filter(a => this.selectedServices.indexOf(a[this.key]) === -1)
          .map(a => a[this.key])
      );
    }
    console.log('this.selectedServices', this.selectedServices);
    if (emit) {
      this.selectedServiceChange.emit(this.selectedServices);
    }
  }
  public isChecked(groupName?: string): boolean {
    if (groupName) {
      const allValues = this.values[groupName];
      return (
        allValues.filter(a => this.selectedServices.indexOf(a[this.key]) === -1)
          .length === 0
      );
    } else {
      const allValues = Object.keys(this.values).flatMap(r => [
        ...this.values[r]
      ]);
      return allValues.length === this.selectedServices.length;
    }
  }
}
