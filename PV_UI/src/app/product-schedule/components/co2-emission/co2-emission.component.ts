import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/app/data.service';
import { CarbonOptionsComponent } from 'src/app/shared/components/carbon-options/carbon-options.component';
import * as constants from './../../../shared/product-manager-constants';
@Component({
  selector: 'app-co2-emission',
  templateUrl: './co2-emission.component.html',
  styleUrls: ['./co2-emission.component.scss']
})
export class Co2EmissionComponent implements OnInit {
  public constants = constants;
  public calculatedCargoWt;
  constructor(public dataService: DataService, public dialog: MatDialog) {}

  @Input() medianCo2Total: number;
  @Input() medianCo2: number;
  @Input() medianCo2Nz: any;
  @Input()
  get cargoWt() {
    return this._cargoWt;
  }
  set cargoWt(value) {
    if (value > 0) {
      this._cargoWt = value;
      this.calculateMedians();
    }
  }
  private _cargoWt;

  private _cargoVolumeOption;
  @Input() public set cargoVolumeOption(op) {
    this._cargoVolumeOption = op;
    this.calculateMedians();
  }
  public get cargoVolumeOption(): any {
    return this._cargoVolumeOption;
  }

  @Input() portCode;
  @Input() destinationPortCode;
  @Output() sendFeedback = new EventEmitter();
  public selectedRoute;
  public medianValues;
  ngOnInit(): void {
    this.selectedRoute = {
      roadKm: 'na',
      costalKm: '1',
      railKm: 'na',
      airKm: 'na'
    };

    /* this.dataService.getCarbonEmissionData().subscribe(result => { */
    let result = this.medianCo2Nz;
    //console.log(result);
    if (result) {
      let route = result.routes.find(
        item =>
          item.from === this.portCode && item.to === this.destinationPortCode
      );
      if (route) {
        this.selectedRoute = route;
      }
      const shipDetails = {
        type: 'costal',
        co2: this.medianCo2,
        label: 'Vessel'
      };
      this.medianValues = [...result.co2median];
      this.medianValues.unshift(shipDetails);
      this.calculateMedians();
    }
    /* }); */
  }

  public calculateMedians(): void {
    this.calculatedCargoWt =
      this.cargoVolumeOption === 'TEU' ? this.cargoWt * 23 : this.cargoWt;
    if (this.medianValues && this.selectedRoute) {
      this.medianValues = this.medianValues.map(obj => ({
        ...obj,
        value:
          Number(obj.co2) *
          this.calculatedCargoWt *
          (Number(this.selectedRoute[obj.type + 'Km']) > 0
            ? Number(this.selectedRoute[obj.type + 'Km'])
            : 0)
      }));

      this.medianValues.forEach(elem => {
        if (elem.type !== 'costal') {
          elem['value'] = elem.value > 0 ? elem.value / 1000 : elem.value;
        }
      });
      const max = this.medianValues.reduce((prev, current) =>
        Number(prev.value) > Number(current.value) ? prev : current
      );
      const _largest = max && max.value;
      for (const item of this.medianValues) {
        const perc = item.value ? (item.value / _largest) * 100 : 0;
        const pix = (perc / 100) * 261;
        item.percentage = perc;
        item.pixel = pix;
        item.km = Number(this.selectedRoute[item.type + 'Km']);
        item.icon = constants[item.type.toUpperCase() + '_ICON'];
      }
    }
  }

  public openFeedback() {
    this.sendFeedback.emit();
  }

  public openPopUp() {
    const dialogRef = this.dialog.open(CarbonOptionsComponent, {
      width: '616px',
      data: {
        medianCo2: this.medianCo2,
        cargoWt: this.cargoWt
      },
      backdropClass: 'backdropBackground'
    });
  }
}
