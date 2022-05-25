import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/data.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { Voyage } from '../../settings-model/voyage';
import { DefaultPopupComponent } from '../default-popup/default-popup.component';

@Component({
  selector: 'app-setting-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  public originalList;
  public voyageDetails;
  public paginationIndex = 1;
  private _result;
  @Input()
  set result(res) {
    this._result = res;
    this.initializeDetails();
  }

  get result() {
    return this._result;
  }



  constructor(
    public dataService: DataService,
    public loader: LoaderService,
    public dialog: MatDialog,
  ) { }

  public initializeDetails(): void {
    console.log(screen.width);
    this.paginationIndex = 1;
    this.originalList = [...this.result];
    let slicedList = this.originalList.slice(0, 2);
    this.voyageDetails = new Voyage;
    this.voyageDetails.setVessels(slicedList);
  }

  ngOnInit(): void {
  }

  public loadMore() {
    this.paginationIndex += 1;
    let slicedList = this.originalList.slice((this.paginationIndex - 1) * 2, ((this.paginationIndex - 1) * 2) + 2);
    let voyage = new Voyage;
    voyage.setVessels(slicedList);
    this.voyageDetails.vessels = [...this.voyageDetails.vessels, ...slicedList];
  }


  public saveThreshold(vessel, port) {

    if (port.isDefault) {
      this.saveDefaultItems(vessel, port);
    } else {
      let portThresholds = this.getObjectDetails(port);
      let selectedObj = {
        direction: vessel.direction,
        pol: port.port_code,
        serviceCode: vessel.service_code,
        thresholdList: portThresholds,
        vesselName: vessel.vessel_name,
        voyager: vessel.voyage_number
      };

      this.loader.show();
      this.dataService.saveThresholdData(selectedObj).subscribe(res => {
        this.loader.hide();
      });
    }

  }

  public saveDefaultItems(vessel, port): void {
    let selectedService, selectedVessel, selectedDirection;
    let selectedPort;

    console.log(vessel);
    console.log(port);

    selectedService = vessel.service_code;
    selectedVessel = vessel.vessel_code;
    selectedDirection = vessel.direction;
    selectedPort = port;

    let portThresholds = this.getObjectDetails(port);
    let selectedObj = {
      direction: vessel.direction,
      pol: port.port_code,
      serviceCode: vessel.service_code,
      thresholdList: portThresholds,
      vesselName: vessel.vessel_name,
      voyager: []
    };

    this.voyageDetails?.vessels?.forEach(_vessel => {
      console.log(_vessel);

      if (selectedService === _vessel.service_code
        && selectedVessel === _vessel.vessel_code
        && selectedDirection === _vessel.direction) {

        let vPort = _vessel?.ports.find(_port => _port.port_code === selectedPort.port_code);
        console.log(vPort);
        if (vPort) {
          selectedObj.voyager.push(_vessel.voyage_number);
        }
      }
    });

    this.loader.show();
    this.dataService.saveThresholdDefaultData(selectedObj).subscribe(res => {
      this.loader.hide();
    });




  }

  public getObjectDetails(port) {
    let thresholds = port.thresholdList;
    let thresholdsList = [];
    for (const key in thresholds) {
      if (Object.prototype.hasOwnProperty.call(thresholds, key)) {
        const element = thresholds[key];
        thresholdsList.push(element);
      }
    }
    return thresholdsList;
  }

  public onDefaultChange(port) {
    if (port.isDefault) {
      const dialogRef: MatDialogRef<DefaultPopupComponent> = this.dialog.open(
        DefaultPopupComponent,
        {
          width: '367px',
          data: {
          },
          disableClose: true,
          backdropClass: 'backdropBackground',
          scrollStrategy: new NoopScrollStrategy()
        }
      );
      dialogRef.afterClosed().subscribe(result => {
        if (result === AppConstants.APPROVE) {
        } else {
          port.isDefault = false;
        }
      });
    }
  }

  public validate(port) {
    for (const key in port.thresholdList) {
      if (Object.prototype.hasOwnProperty.call(port.thresholdList, key)) {
        const element = port.thresholdList[key];
        if (element.max === '' || element.min === ''
          || element.max === null || element.min === null) {
          return true;
        }
      }
    }
    return false;
  }


}
