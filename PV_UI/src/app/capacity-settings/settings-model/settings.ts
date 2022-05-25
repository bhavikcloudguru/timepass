import { IJsonData } from 'src/app/shared/interfaces/ijson-data';
import { formatDate } from '@angular/common';
export class Settings implements IJsonData {


  public toJson(): JSON {
    let data;
    return data;
  }

  public setData(data, initialData, selectedData) {

    const settingData = {
      capacityTeamList: [],
      directions: [],
      ports: [],
      services: [],
      tradeLaneList: [],
      months: 6
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];

        if (key === 'capacityTeamList') {
          let selectedTeams = element.filter(item => item.selected);
          let selectedTemsItems = [];
          if (selectedData[key] && selectedTeams.length > 0) {
            selectedTemsItems = selectedTeams.map(_v => _v.value);
          } else {
            selectedTemsItems = initialData[key].map(_v => _v.value);
          }
          settingData.capacityTeamList = [...selectedTemsItems];

        } else if (key === 'directions') {
          let selectedDirections = element.filter(item => item.selected);
          let selectedDirectionsItems = [];
          if (selectedData[key] && selectedDirections.length > 0) {
            selectedDirectionsItems = selectedDirections.map(_v => { return { direction: _v.value } });
          } else {
            selectedDirectionsItems = initialData[key].map(_v => { return { direction: _v.value } });
          }
          settingData.directions = [...selectedDirectionsItems];
        } else if (key === 'ports') {
          let selectedPorts = element.filter(item => item.selected)
          let selectedPortsItems;

          if (selectedData[key] && selectedPorts.length > 0) {
            selectedPortsItems = selectedPorts.map(_v => { return { port_code: _v.value } });
          } else {
            selectedPortsItems = initialData[key].map(_v => { return { port_code: _v.value } });
          }
          settingData.ports = [...selectedPortsItems];
        } else if (key === 'services') {
          let selectedServices = element.filter(item => item.selected);
          let selectedServicesItems = [];
          if (selectedData[key] && selectedServices.length > 0) {
            selectedServicesItems = selectedServices.map(_v => { return { service_code: _v.value } });
          } else {
            selectedServicesItems = initialData[key].map(_v => { return { service_code: _v.value } });
          }
          settingData.services = [...selectedServicesItems];
        } else if (key === 'tradeLaneList') {
          let selectedTrade = element.filter(item => item.selected)
          let selectedTradeItems = [];
          if (selectedData[key] && selectedTrade.length > 0) {
            selectedTradeItems = selectedTrade.map(_v => _v.value);
          } else {
            selectedTradeItems = initialData[key].map(_v => _v.value);
          }
          settingData.tradeLaneList = [...selectedTradeItems];
        } else if (key === 'months') {
          let selectedMonth = element.find(item => item.selected)?.value;
          settingData.months = selectedMonth ? selectedMonth.split(' ')[0] : '6'
        }
      }
    }
    return settingData;
  }


  public setApplyData(data, initialData) {

    const settingData = {
      capacityTeamList: [],
      directions: [],
      ports: [],
      services: [],
      tradeLaneList: [],
      months: 6
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];

        if (key === 'capacityTeamList') {
          let selectedTeams = element.filter(item => item.selected);
          let selectedTemsItems = [];
          if (selectedTeams.length > 0) {
            selectedTemsItems = selectedTeams.map(_v => _v.value);
          } else {
            selectedTemsItems = element.map(_v => _v.value);
          }
          settingData.capacityTeamList = [...selectedTemsItems];

        } else if (key === 'directions') {
          let selectedDirections = element.filter(item => item.selected);
          let selectedDirectionsItems = [];
          if (selectedDirections.length > 0) {
            selectedDirectionsItems = selectedDirections.map(_v => { return { direction: _v.value } });
          } else {
            selectedDirectionsItems = initialData[key].map(_v => { return { direction: _v.value } });
          }
          settingData.directions = [...selectedDirectionsItems];
        } else if (key === 'ports') {
          let selectedPorts = element.filter(item => item.selected)
          let selectedPortsItems;

          if (selectedPorts.length > 0) {
            selectedPortsItems = selectedPorts.map(_v => { return { port_code: _v.value } });
          } else {
            selectedPortsItems = initialData[key].map(_v => { return { port_code: _v.value } });
          }
          settingData.ports = [...selectedPortsItems];
        } else if (key === 'services') {
          let selectedServices = element.filter(item => item.selected);
          let selectedServicesItems = [];
          if (selectedServices.length > 0) {
            selectedServicesItems = selectedServices.map(_v => { return { service_code: _v.value } });
          } else {
            selectedServicesItems = initialData[key].map(_v => { return { service_code: _v.value } });
          }
          settingData.services = [...selectedServicesItems];
        } else if (key === 'tradeLaneList') {
          let selectedTrade = element.filter(item => item.selected)
          let selectedTradeItems = [];
          if (selectedTrade.length > 0) {
            selectedTradeItems = selectedTrade.map(_v => _v.value);
          } else {
            selectedTradeItems = initialData[key].map(_v => _v.value);
          }
          settingData.tradeLaneList = [...selectedTradeItems];
        } else if (key === 'months') {
          let selectedMonth = element.find(item => item.selected)?.value;
          settingData.months = selectedMonth ? selectedMonth.split(' ')[0] : '6'
        }
      }
    }
    return settingData;
  }


  public mapDirection(key): void {
    let data = {
      E: 'East',
      W: 'West',
      N: 'North',
      S: 'South'
    }
    return data[key];
  }


}

