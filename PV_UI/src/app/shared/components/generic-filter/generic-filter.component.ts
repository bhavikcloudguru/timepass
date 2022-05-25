import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-generic-filter',
  templateUrl: './generic-filter.component.html',
  styleUrls: ['./generic-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericFilterComponent implements OnInit, AfterViewInit {
  public isAllSelected = false;
  private _services = [] as any[];
  @Input() public selectDisplayString: string;
  @Input() public selectedDisplayString: string;
  @Input() public allSelectedString: string;
  @Input() public key: string;
  @Input() public displayName: string;
  @Input() public initialFilterValue: any[] = [];
  @Input() public set services(value: any[]) {
    value
      //.filter(v => !v.feeder)
      .forEach(v => {
        this._services.push(v);
      });
    console.log('services', value);
    /*  const feeders = value.filter(v => v.feeder);
    if (feeders.length > 0) {
      this._services.push({ serviceCode: 'feeder', serviceName: 'Feeders' });
    }*/
  }
  public get services() {
    return this._services;
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
      if (this.selectedServices.length !== this.services.length) {
        this.selectedServices = [];
        this.services.forEach(s => this.selectedServices.push(s[this.key]));
      } else {
        this.selectedServices = [];
      }
    }
    this.selectedServices = [...this.selectedServices];
    if (emit) {
      this.selectedServiceChange.emit(this.selectedServices);
    }
  }
}
