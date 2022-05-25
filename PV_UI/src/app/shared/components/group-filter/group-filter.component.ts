import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { element } from 'protractor';

@Component({
  selector: 'app-group-filter',
  templateUrl: './group-filter.component.html',
  styleUrls: ['./group-filter.component.scss']
})
export class GroupFilterComponent implements OnInit {
  private _filterData;
  @Input()
  set filterData(value) {
    if (value) {
      this._filterData = value;
      this.setFilteredData();
    }
  }
  get filterData(): any {
    return this._filterData;
  }
  @Output() selectionChange = new EventEmitter<any>();
  public displayData;
  public selectedItem: any[] = [];
  public isAllItems = true;

  constructor() {}

  ngOnInit(): void {}

  public setFilteredData(): void {
    let items = { ...this.filterData };
    for (const key in items) {
      if (Object.prototype.hasOwnProperty.call(items, key)) {
        let _element = items[key];
        _element = _element.map(item => ({ ...item, isChecked: true }));
        _element = _element.filter(
          (v, i) => _element.findIndex(item => item.code == v.code) === i
        );
        _element.isChecked = true;
        items[key] = _element;
      }
    }
    this.displayData = items;
    //
  }

  public selectAllItems(source: string, event?: any): void {
    if (!source) {
      this.isAllItems = event.checked;
      for (const key in this.displayData) {
        if (Object.prototype.hasOwnProperty.call(this.displayData, key)) {
          let element = this.displayData[key];
          this.displayData[key] = element.map(obj => ({
            ...obj,
            isChecked: event.checked
          }));
          this.displayData[key].isChecked = event.checked;
        }
      }
    } else {
      this.displayData[source] = this.displayData[source].map(obj => ({
        ...obj,
        isChecked: event.checked
      }));
      this.displayData[source].isChecked = event.checked;
    }
    this.checkAllItem();
  }

  public checkAllItem() {
    let allItemsChecked = true;
    for (const key in this.displayData) {
      if (Object.prototype.hasOwnProperty.call(this.displayData, key)) {
        let el = this.displayData[key];
        allItemsChecked = el.isChecked ? allItemsChecked : false;
      }
    }
    this.isAllItems = allItemsChecked ? true : false;
    this.selectionChange.emit(this.displayData);
  }

  public changed(item, event) {
    item.isChecked = event.checked;
    for (const key in this.displayData) {
      if (Object.prototype.hasOwnProperty.call(this.displayData, key)) {
        let el = this.displayData[key];
        if (el.some(value => !value.isChecked)) {
          el.isChecked = false;
        } else {
          el.isChecked = true;
        }
      }
    }
    this.checkAllItem();
  }
}
