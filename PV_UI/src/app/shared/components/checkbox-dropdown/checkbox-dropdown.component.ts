import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkbox-dropdown',
  templateUrl: './checkbox-dropdown.component.html',
  styleUrls: ['./checkbox-dropdown.component.scss']
})
export class CheckboxDropdownComponent implements OnInit {

  @Input() label;
  @Input() width;
  @Input() data;
  @Input() ref;
  public selectedValue;
  public isSelectAll = false;
  @Output() public open = new EventEmitter<any>();
  @Output() public optionselect = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {



  }

  public displayValue(value: any[] | string) {
    let dataLength = this.data?.length;
    let selectedLength = this.data.filter((obj) => obj.selected === true).length;
    this.isSelectAll = false;
    if(dataLength === selectedLength) {
      this.isSelectAll = true;
      return 'All (' + dataLength + ')'
    } if(selectedLength === 1) {
      let findV = this.data.find(item=> item.selected);
      return findV.value;
    } else if(selectedLength && selectedLength>1) {
      return 'Selected(' + selectedLength + ')';
    }
  }

  public changeValue(item,ad) {
    this.isSelected = true;
    setTimeout(() => {
      item.selected = !item.selected;
      this.selectedValue = Math.random();
      this.optionSelected();
    }, 100);
  }
  public isSelected = false;
  public changeAllValue() {
    this.isSelected = true;
    setTimeout(() => {
      if(this.isSelectAll) {
        this.data.forEach(item=>item.selected = false);
      } else {
        this.data.forEach(item=>item.selected = true);
      }
      this.selectedValue = Math.random();
      this.optionSelected();
    }, 100);
    
  }


  public optionSelected(): void {
    this.optionselect.emit(this.ref); 
  }



  public selectItem(value) {
   // console.log(value);
  }


  public resetData() {
    this.data.forEach(item=>item.selected = false);
    this.isSelected = false;
    this.selectedValue = Math.random();
  }

  public updateData() {
    this.selectedValue = Math.random();
  }

  public sortBy(prop: string) {
    return this.data.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

}
