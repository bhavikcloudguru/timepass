import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-checkbox-autocomplete',
  templateUrl: './checkbox-autocomplete.component.html',
  styleUrls: ['./checkbox-autocomplete.component.scss']
})
export class CheckboxAutocompleteComponent implements OnInit {

  @Input() label;
  @Input() width;
  
  @Input() ref;
  public selectedValue;
  public isSelectAll = false;
  public dataFilter: Observable<any[]>;
  private _data;
  @Input()
  get data() {
    return this._data;
  }
  set data(list) {
    if (list) {
     // list.sort((a, b) => a['vessel_name'] > b['vessel_name'] ? 1 : a['vessel_name'] === b['vessel_name'] ? 0 : -1);
      this._data = list;
      this.setFilter();
    }
  }


  constructor() { }

  ngOnInit(): void {
  this.setFilter();
  }

  public setFilter() {
    this.setValue();
    this.dataFilter = of(this.data)
      .pipe(
        map(value => this.filter('')),
      )

    
  }



  public doFilter(valuex: string): void {
    let v = valuex ? valuex : ''
    this.dataFilter = of(this.data)
      .pipe(
        map(value => this.filter(v)),
      )

  }



  public filter(value): any {
    try {
      const filterValue = value.toLowerCase();
      let fvalues = this.data.filter(
        (option) =>
          option.vessel_name.toLowerCase().indexOf(filterValue) === 0 ||
          option.voyage_code.toLowerCase().indexOf(filterValue) === 0
      );
      return fvalues;

    } catch (error) {
      return null;
    }
  }




  public displayValue(value: any[] | string) {
    let dataLength = this.data?.length;
    let selectedLength = this.data.filter((obj) => obj.selected === true).length;
    this.isSelectAll = false;
    if (selectedLength && dataLength === selectedLength) {
      this.isSelectAll = true;
      return 'All (' + dataLength + ')'
    } if (selectedLength === 1) {
      let findV = this.data.find(item => item.selected);
      return findV.vessel_name + ' ' +findV.voyage_number + findV.direction;
    } else if (selectedLength && selectedLength > 1) {
      return '(' + selectedLength + ')';
    }
  }

  public changeValue(item, ad) {
    setTimeout(() => {
      item.selected = !item.selected;
      this.selectedValue = Math.random();
    }, 100);
  }

  public changeAllValue() {

    setTimeout(() => {
      if (this.isSelectAll) {
        this.data.forEach(item => item.selected = false);
      } else {
        this.data.forEach(item => item.selected = true);
      }
      this.selectedValue = Math.random();
    }, 100);

  }


  public selectItem(value) {
    // console.log(value);
  }


  public resetData() {
    this.data.forEach(item => item.selected = false);
    this.selectedValue = Math.random();
  }
  public setValue() {
    this.selectedValue = Math.random();
  }

}
