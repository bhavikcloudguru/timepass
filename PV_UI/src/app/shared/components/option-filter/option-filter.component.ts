import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-option-filter',
  templateUrl: './option-filter.component.html',
  styleUrls: ['./option-filter.component.scss']
})
export class OptionFilterComponent implements OnInit {
  public selectDisplayString = 'select';
  public selectedOption;
  @Input() public selected;
  @Input() public data: any[] = [];
  @Output() selectedServiceChange = new EventEmitter<any>();
  constructor() {}

  ngOnInit(): void {
    this.selectedOption = this.data.find(item => item.value === this.selected);
  }

  public selectService(event): void {
    this.selectedServiceChange.emit(event);
  }
}
