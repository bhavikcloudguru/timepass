import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dropdown-option',
  templateUrl: './dropdown-option.component.html',
  styleUrls: ['./dropdown-option.component.scss']
})
export class DropdownOptionComponent implements OnInit {

  @Input() label;
  @Input() width;
  @Input() data;
  @Input() ref;
  public selectedValue;
  public isSelectAll = false;
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
      return '(' + selectedLength + ')';
    }
  }

  public changeValue(item,ad) {
    this.resetData();
    setTimeout(() => {
      item.selected = !item.selected;
      this.selectedValue = Math.random();
      this.optionSelected();
    }, 100);
  }


  public optionSelected(): void {
    this.optionselect.emit();
  }

  public selectItem(value) {
   // console.log(value);
  }


  public resetData() {
    this.data.forEach(item=>item.selected = false);
    this.selectedValue = Math.random();
  }

}
