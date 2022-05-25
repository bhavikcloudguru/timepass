import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-port-filter',
  templateUrl: './port-filter.component.html',
  styleUrls: ['./port-filter.component.scss'],
  encapsulation: ViewEncapsulation.None // to use css
})
export class PortFilterComponent implements OnInit, AfterViewInit {
  constructor() {}

  @Input() originPorts = [];
  @Input() destinationPorts = [];
  @Input() originCountry: string;
  @Input() destinationCountry: string;
  public selectedPort: any[] = [];
  @Input() selectedCountries: any;
  @Output() selectedPortChange = new EventEmitter<any>();
  public isAllports = false;
  public isAllOriginPorts = false;
  public isAllDestinationPorts = false;
  @Input() isSameOriginDestinationCountry: boolean;
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.selectAllPorts('', true);
  }
  /**
   *
   * @param source - either '' or origin or destination
   * ''- means all ports
   * We have 3 boolean flags - isAllports , isAllOriginPorts and isAllDestinationPorts
   * We can have 3 places from which method can be called.
   * Select All Ports
   * Select All origin ports
   * Select All destination ports
   *
   * Select All origin ports---isAllOriginPorts is set to true if all ports are checked and
   * isAllOriginPorts to false is all origin ports were unchecked
   *
   * Select All destination ports---isAllDestinationPorts is set to true if all ports are checked and
   * isAllDestinationPorts to false is all origin ports were unchecked
   *
   * Select All Ports---isAllports is set to true is all ports were checked and isAllports is set to false
   * if all ports are removed
   *
   * Since we have only one method for all buttons, check source and then each flags to take appropriate actions
   *
   * when setting either (isAllports , isAllOriginPorts) or (isAllports , isAllDestinationPorts)
   * we need to use truth table
   * (isAllports , isAllOriginPorts)
   *    T             T    -------- You need to remove data from filter no matter the source
   *    T             F    -------- This scenario is not possible.
   *    F             T    -------- You add if source is '' and remove if source is All origin
   *    F             F    -------- You need to add data to filter no matter the source
   *
   */
  public selectAllPorts(source: string, emit?: boolean) {
    console.log('selectAllPorts');
    let oldPorts = [];
    // if its either all origin or all destination, we need to keep earlier ports selected too
    if (source) {
      oldPorts = this.selectedPort;
    }
    this.selectedPort = [];
    // this should be executed for all or origin ports
    if (!source || source === 'origin') {
      // neither all ports nor origin ports check box is currently checked.
      if (
        (!this.isAllOriginPorts && !this.isAllports) ||
        (!source && !this.isAllports)
      ) {
        this.originPorts.forEach(o => {
          this.selectedPort.push(o.portCode);
        });
        this.isAllOriginPorts = true;
      } else {
        // either all ports or
        oldPorts = oldPorts.filter(
          o => this.originPorts.findIndex(op => op.portCode === o) === -1
        );
        this.isAllOriginPorts = false;
      }
    }
    // this should be executed for all or destination ports
    if (!source || source === 'destination') {
      if (
        (!this.isAllDestinationPorts && !this.isAllports) ||
        (!source && !this.isAllports)
      ) {
        this.destinationPorts.forEach(o => {
          this.selectedPort.push(o.portCode);
        });
        this.isAllDestinationPorts = true;
      } else {
        oldPorts = oldPorts.filter(
          o => this.destinationPorts.findIndex(op => op.portCode === o) === -1
        );
        this.isAllDestinationPorts = false;
      }
    }
    // if its not all ports, then add previously selected ports
    if (source) {
      this.selectedPort = [...this.selectedPort, ...oldPorts];
    }
    this.isAllports = this.isAllOriginPorts && this.isAllDestinationPorts;
    // emit
    if (emit) {
      this.emit();
    }
  }
  private emit() {
    setTimeout(() => {
      this.selectedPortChange.emit(this.selectedPort);
    }, 2);
  }

  public changed(portCode: string) {
    const index = this.selectedPort.indexOf(portCode);
    if (index === -1) {
      this.selectedPort.push(portCode);
    } else {
      this.selectedPort.splice(index, 1);
    }
    this.selectedPort = [...this.selectedPort];
    // check if all ports are selected.
    let allPortsSelected = false;
    allPortsSelected =
      // check if all origin ports are selected
      this.originPorts.filter(o => this.selectedPort.indexOf(o.portCode) === -1)
        .length === 0;
    this.isAllOriginPorts = allPortsSelected;
    allPortsSelected = false;
    //  check if all destination ports selected
    allPortsSelected =
      this.destinationPorts.filter(
        o => this.selectedPort.indexOf(o.portCode) === -1
      ).length === 0;
    this.isAllDestinationPorts = allPortsSelected;
    this.isAllports = this.isAllOriginPorts && this.isAllDestinationPorts;
    // check for all ports or all origin or all destination
    this.emit();
  }
}
