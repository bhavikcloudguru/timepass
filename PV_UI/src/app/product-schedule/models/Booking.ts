import { IJsonData } from 'src/app/shared/interfaces/ijson-data';

export class Booking implements IJsonData {
  bulk = false;
  container = true;
  portCode: string;
  vesselCode: string;
  voyageNumber: string;
  direction: string;
  pol: string;
  pod: string;
  cargo: string;
  numberOfUnits: string;
  cubicMeasurement: string;
  shipperName: string;
  consigneeName: string;
  dimensions: any = { height: '', width: '', length: '' };
  totalWeight: number;
  description: string;
  unNumber: string;
  oog = false;
  haz = false;
  hazClass: number;
  equipType: string;
  equipSize: number;
  commodityType: string;
  oogDetails: any = { overHeightBy: '', overWidthBy: '', overLengthBy: '' };
  routeInfo: Array<RouterInfo> = [];
  capacityLight = new CapacityLight();
  fromEmail: string;
  origin: string;

  public toJson(): JSON {
    const routeInfo = this.routeInfo;
    const capacityLight = this.capacityLight;
    const data: any = {
      bulk: this.bulk,
      container: this.container,
      portCode: this.portCode,
      vesselCode: this.vesselCode,
      voyageNumber: this.voyageNumber,
      direction: this.direction,
      pol: this.pol,
      pod: this.pod,
      cargo: this.cargo,
      numberOfUnits: this.numberOfUnits,
      cubicMeasurement: this.cubicMeasurement,
      shipperName: this.shipperName,
      consigneeName: this.consigneeName,
      dimensions: this.dimensions,
      totalWeight: this.totalWeight,
      description: this.description,
      unNumber: this.unNumber,
      oog: this.oog,
      haz: this.haz,
      hazClass: this.hazClass,
      equipType: this.equipType,
      equipSize: this.equipSize,
      commodityType: this.commodityType,
      oogDetails: this.oogDetails,
      routeInfo: this.routeInfo,
      capacityLight: {
        color: capacityLight.color,
        notes: capacityLight.notes
      },
      fromEmail: this.fromEmail
    };

    return data;
  }

  public setData(data, list, pod): void {
    this.pol = data.portCode;
    this.pod = pod;
    this.portCode = data.portCode;
    this.vesselCode = data.vesselCode;
    this.voyageNumber = data.voyageNumber.slice(0, -1);
    this.direction = data.voyageNumber[data.voyageNumber.length - 1];
    this.cargo = 'cargo';
    const capacitylight = new CapacityLight();
    capacitylight.color = data.trafficStatus;
    capacitylight.notes = data.notes;
    this.capacityLight = capacitylight;

    for (const item of list) {
      const routerinfo = new RouterInfo();
      routerinfo.feeder = item.feeder;
      routerinfo.portCode = item.portCode;
      routerinfo.portCountry = item.countryName;
      routerinfo.portName = item.portNameInfo;
      routerinfo.vesselCode = item.vesselCode;
      routerinfo.transshipmentState = false;
      this.routeInfo.push(routerinfo);
    }
  }

  public setFormData(data, file?: any, image?: any): FormData {
    const formdata = new FormData();
    formdata.append(
      'capacityManagerEmailRequest',
      new Blob([JSON.stringify(data)], {
        type: 'application/json'
      })
    );

    if (file) {
      formdata.append('files', file);
    }

    if (image) {
      formdata.append('images', image);
    }

    return formdata;
  }

  public uniquePortList(list: any): Array<any> {
    const items = [...list]
      .reverse()
      .filter(
        (item, index, self) =>
          index === self.findIndex(t => t.portCode === item.portCode)
      );
    return items.reverse();
  }
}

class CapacityLight {
  color: string;
  notes: string;
}

class RouterInfo {
  portCode: string;
  portName: string;
  portCountry: string;
  feeder: boolean;
  vesselCode: string;
  voyage: string;
  direction: string;
  transshipmentState: boolean;
}
