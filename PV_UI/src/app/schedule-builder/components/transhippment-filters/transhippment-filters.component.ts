import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-transhippment-filters',
  templateUrl: './transhippment-filters.component.html',
  styleUrls: ['./transhippment-filters.component.scss']
})
export class TranshippmentFiltersComponent implements OnInit {
  private _transshipmentCount = [];
  private _transshipmentPorts = [];
  public selectedRange = {} as { minValue: number; maxValue: number };
  public _maxTranshippmentDuration: number;
  @Input() public set transshipmentPorts(value: any[]) {
    this._transshipmentPorts = value;
  }
  public get transshipmentPorts(): any[] {
    return this._transshipmentPorts;
  }
  @Input() public set transshipmentCount(value: any[]) {
    this._transshipmentCount = value;
  }
  public get transshipmentCount(): any[] {
    return this._transshipmentCount;
  }
  @Input() public set maxTranshippmentDuration(value: number) {
    this._maxTranshippmentDuration = value;
    this.selectedRange.minValue = 0;
    this.selectedRange.maxValue = value;
  }
  public get maxTranshippmentDuration() {
    return this._maxTranshippmentDuration;
  }

  public selectedPorts = [];
  public selectedCounts = [];
  public selectedService = []; // used as only placeholder
  @Output() selectedTransshipmentPortsChange = new EventEmitter<any>();
  @Output() selectedTransshipmentCountChange = new EventEmitter<any>();
  @Output() selectedRangeChange = new EventEmitter<{
    minValue: number;
    maxValue: number;
  }>();
  constructor() {}
  ngAfterViewInit(): void {
    this.selectedPort('', true);
    this.selectCount('', true);
    this.selectedRangeChange.emit(this.selectedRange);
  }

  ngOnInit(): void {}
  public selectedPort(value: any, emit?: boolean) {
    if (value) {
      // select/deselect one value.
      if (this.selectedPorts.indexOf(value) === -1) {
        this.selectedPorts.push(value);
      } else {
        this.selectedPorts = this.selectedPorts.filter(x => x !== value);
      }
    } else {
      // select deselect all
      if (this.selectedPorts.length !== this.transshipmentPorts.length) {
        this.selectedPorts = [];
        this.transshipmentPorts.forEach(s =>
          this.selectedPorts.push(s['portCode'])
        );
      } else {
        this.selectedPorts = [];
      }
    }
    this.selectedPorts = [...this.selectedPorts];
    if (emit) {
      console.log('this.selectedPorts', this.selectedPorts);
      this.selectedTransshipmentPortsChange.emit(this.selectedPorts);
    }
  }
  public selectCount(value: any, emit?: boolean): void {
    if (value) {
      // select/deselect one value.
      if (this.selectedCounts.indexOf(value) === -1) {
        this.selectedCounts.push(value);
      } else {
        this.selectedCounts = this.selectedCounts.filter(x => x !== value);
      }
    } else {
      // select deselect all
      if (this.selectedCounts.length !== this.transshipmentCount.length) {
        this.selectedCounts = [];
        this.transshipmentCount.forEach(s =>
          this.selectedCounts.push(s['count'])
        );
      } else {
        this.selectedCounts = [];
      }
    }
    this.selectedCounts = [...this.selectedCounts];
    if (emit) {
      console.log('this.selectedCounts', this.selectedCounts);
      this.selectedTransshipmentCountChange.emit(this.selectedCounts);
    }
  }
  public isChecked(groupName?: string): boolean {
    if (!groupName) {
      return (
        this.selectedCounts.length === this.transshipmentCount.length &&
        this.selectedPorts.length === this.transshipmentPorts.length &&
        this.selectedRange.minValue == 0 &&
        this.selectedRange.maxValue == this.maxTranshippmentDuration
      );
    }
    if (groupName == 'counts') {
      return this.selectedCounts.length === this.transshipmentCount.length;
    }
    if (groupName === 'ports') {
      return this.selectedPorts.length === this.transshipmentPorts.length;
    }
  }
  public selectAll() {
    if (this.isChecked('')) {
      // uncheck all
      this.selectedCounts = [];
      this.selectedPorts = [];
      this.selectedTransshipmentPortsChange.emit(this.selectedPorts);
      this.selectedTransshipmentCountChange.emit(this.selectedCounts);
      this.selectedRange.maxValue = 0;
      this.selectedRange.minValue = 0;
      this.selectedRangeChange.emit(this.selectedRange);
    } else {
      // check all
      if (!this.isChecked('counts')) {
        this.selectCount('', true);
      }
      if (!this.isChecked('ports')) {
        this.selectedPort('', true);
      }
      this.selectedRange.maxValue = this.maxTranshippmentDuration;
      this.selectedRange.minValue = 0;
      this.selectedRangeChange.emit(this.selectedRange);
    }
  }
}
