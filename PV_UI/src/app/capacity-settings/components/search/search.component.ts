import { Component, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { settings } from 'cluster';
import { DataService } from 'src/app/data.service';
import { LoaderService } from 'src/app/shared/api-service/loader/loader.service';
import { CheckboxDropdownComponent } from 'src/app/shared/components/checkbox-dropdown/checkbox-dropdown.component';
import { Settings } from '../../settings-model/settings';

@Component({
  selector: 'app-setting-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  public capacityData;

  public capacityTeamList;
  public tradeLaneList;
  public services;
  public directions;
  public polList;
  public timePeriod;
  public vesselVoyage = [];
  @Output() public result = new EventEmitter<any>();


  @ViewChildren(CheckboxDropdownComponent) public dropbox: QueryList<CheckboxDropdownComponent>;

  constructor(
    public dataService: DataService,
    public loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.loader.show();
    this.dataService.getInitialDropDownDetails().subscribe(res => {
      this.loader.hide();
      this.capacityData = res;
      this.initializeDetails();
    });

    this.timePeriod = [
      {
        value: '1 month'
      },
      {
        value: '2 months'
      },
      {
        value: '3 months'
      },
      {
        value: '6 months',
        selected: true
      }
    ];


  }

  public openItem(event) {
    // console.log(this.dropbox);
  }

  public resetAll(): void {
    this.initializedData['capacityTeamList'].map(item=>item.selected = false);
    this.initializedData['directions'].map(item=>item.selected = false);
    this.initializedData['ports'].map(item=>item.selected = false);
    this.initializedData['services'].map(item=>item.selected = false);
    this.initializedData['tradeLaneList'].map(item=>item.selected = false);
    this.capacityTeamList = this.initializedData['capacityTeamList'];
    this.directions = this.initializedData['directions'];
    this.polList = this.initializedData['ports'];
    this.services = this.initializedData['services'];
    this.tradeLaneList = this.initializedData['tradeLaneList'];

    this.dropbox.forEach(element => {
      element?.resetData();
    });
  }


  public initializeDetails(): void {
    let setting = new Settings;
    this.capacityTeamList = this.capacityData.capacityTeamList;

    this.capacityTeamList = this.capacityTeamList.map(item => {
      return {
        value: item,
        selected: false
      }
    });
    this.tradeLaneList = this.capacityData.tradeLaneList;
    this.tradeLaneList = this.tradeLaneList.map(item => {
      return {
        value: item,
        selected: false
      }
    });

    this.services = this.capacityData?.services;
    this.services = this.services.map(item => {
      return {
        value: item.service_code,
        selected: false
      }
    });

    this.directions = this.capacityData?.directions;
    this.directions = this.directions.map(item => {
      return {
        value: item.direction,
        display: setting.mapDirection(item.direction),
        selected: false
      }
    });
   console.log(this.directions);
    this.polList = this.capacityData?.ports;
    this.polList = this.polList.map(item => {
      return {
        value: item.port_code,
        selected: false
      }
    });

    this.initializedData = {
      capacityTeamList: [...this.capacityTeamList],
      directions: [...this.directions],
      ports: [...this.polList],
      services: [...this.services],
      tradeLaneList: [...this.tradeLaneList]
    }

  }

  public initializedData = {};

  public apply() {
    let data = {
      capacityTeamList: this.capacityTeamList,
      tradeLaneList: this.tradeLaneList,
      services: this.services,
      ports: this.polList,
      directions: this.directions,
      months: this.timePeriod
    }
    const setting = new Settings();
    this.loader.show();
    let settingData = setting.setApplyData(data,this.initializedData);
    this.dataService.getVesselVoyageDetails(settingData).subscribe(res => {
      this.vesselVoyage = res.vesselVoyegeList;
      this.vesselVoyage.map(item=>item.selected = true);
      this.loader.hide();
      this.refresh();
    });
  }

  public selectOption(event): void {
    let data = {
      capacityTeamList: this.capacityTeamList,
      tradeLaneList: this.tradeLaneList,
      services: this.services,
      ports: this.polList,
      directions: this.directions,
      months: this.timePeriod
    }
    let selectedData = {};
    
    this.dropbox.forEach(element => {
      selectedData[element.ref] = element?.isSelected
    });
 
    console.log(selectedData);

    const setting = new Settings();
    //console.log(data);
    let settingData = setting.setData(data,this.initializedData, selectedData);
    //console.log(settingData);

    this.changeRequestData(settingData, event);

  }

  public changeRequestData(data, event) {
    this.loader.show();
    this.dataService.getDropDownSelectionDetails(data).subscribe(res => {
      //this.capacityData = res;
      //const setting = new Settings();
      this.updateDropdownData(res, event);
      //this.initializeDetails();
      this.loader.hide();
    });
  }


  public updateDropdownData(data, event) {
    let setting = new Settings;
    if (event !== 'capacityTeamList') {
      this.capacityTeamList = data.capacityTeamList;
      this.capacityTeamList = this.capacityTeamList.map(item => {
        return {
          value: item,
          selected: true
        }
      });
    }
    if (event !== 'tradeLaneList') {
      this.tradeLaneList = data.tradeLaneList;
      this.tradeLaneList = this.tradeLaneList.map(item => {
        return {
          value: item,
          selected: true
        }
      });
    }
    if (event !== 'services') {
      this.services = data?.services;
      this.services = this.services.map(item => {
        return {
          value: item.service_code,
          selected: true
        }
      });
    }
    if (event !== 'directions') {
      this.directions = data?.directions;
      this.directions = this.directions.map(item => {
        return {
          value: item.direction,
          display: setting.mapDirection(item.direction),
          selected: true
        }
      });
    }
    if (event !== 'ports') {
      this.polList = data?.ports;
      this.polList = this.polList.map(item => {
        return {
          value: item.port_code,
          selected: true
        }
      });
    }

    this.dropbox.forEach(element => {
      element?.updateData();
    });

  }




  public checkData() {
    let data = {
      capacityTeamList: this.capacityTeamList,
      tradeLaneList: this.tradeLaneList,
      services: this.services,
      ports: this.polList,
      directions: this.directions
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        let ef = element.filter(v => v.selected);
        if (ef.length) { return false };
      }
    }
    return true;
  }

  public refresh(): void {
   // console.log(this.vesselVoyage);
    let data = {
      capacityTeamList: this.capacityTeamList,
      tradeLaneList: this.tradeLaneList,
      services: this.services,
      ports: this.polList,
      directions: this.directions,
      months: this.timePeriod,
    }
    const setting = new Settings();
    this.loader.show();
    let settingData = setting.setApplyData(data,this.initializedData);
    let selectedVessels = this.vesselVoyage.filter(item=> item.selected);
    settingData['vvls'] = selectedVessels;
    
    this.dataService.getVesselPortList(settingData).subscribe(res => {
      this.loader.hide();
      this.result.emit(res);
    });
  }



}
