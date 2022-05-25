import { IJsonData } from 'src/app/shared/interfaces/ijson-data';

export class Booking implements IJsonData {
  fromEmail: string;
  bookingId: string;
  refBookingId: string;
  shipperName: string;
  controlParty: string;
  pol: string;
  pod: string;
  originPort: string;
  destinationPort: string;
  departureDate: string;
  portCode: string;
  vesselCode: string;
  serviceCode: string;
  voyageNumber: string;
  direction: string;
  cargo: string;
  routeInfo: Array<RouterInfo> = [];
  capacityLight = new CapacityLight();
  cargoDetails: Array<Cargo> = [];
  totalWeight: number;
  comments: string;

  public toJson(): JSON {
    const capacityLight = this.capacityLight;
    const data: any = {
      fromEmail: this.fromEmail,
      bookingId: this.bookingId ? this.bookingId : '',
      refBookingId: this.refBookingId,
      shipperName: this.shipperName,
      controlParty: this.controlParty,
      pol: this.pol,
      pod: this.pod,
      departureDate: this.departureDate,
      portCode: this.portCode,
      vesselCode: this.vesselCode,
      serviceCode: this.serviceCode,
      voyageNumber: this.voyageNumber,
      direction: this.direction,
      cargo: this.cargo,
      originPort: this.originPort,
      destinationPort: this.destinationPort,
      capacityLight: {
        color: capacityLight.color,
        notes: capacityLight.notes
      },
      routeInfo: this.routeInfo,
      comments: this.comments
    };
    const cargoDetails = [];

    for (const item of this.cargoDetails) {
      let cargo = {
        container: item.container,
        sequenceId: item.sequenceId,
        bulk: item.bulk,
        cargoType: item.cargoType,
        commodityType: item.commodityType,
        hazClass: item.hazClass,
        unNumber: item.unNumber,
        numberOfUnits: item.numberOfUnits,
        totalWeight: item.totalWeight,
        oog: item.oog,
        oogDetails: item.oogDetails,
        dimensions: item.dimensions,
        description: item.description,
        cubicMeasurement: item.cubicMeasurement,
        files: item.files.map(f => f.name)
      };
      cargoDetails.push(cargo);
      console.log('cargo.........', cargo, item);
    }
    data.cargoDetails = cargoDetails;

    return data;
  }

  public insertCargo(data?: any): void {
    const cargo = new Cargo();
    cargo.hazClass = 'Non Haz';
    this.cargoDetails.push(cargo);
  }
  public deleteCargoType(index: number): void {
    this.cargoDetails.splice(index, 1);
  }

  public setData(data, list, equipment, oogContainers): void {
    const bid = data.bookingId;

    this.bookingId = data.bookingId;
    this.portCode = data.portCode;
    this.vesselCode = data.vesselCode;
    this.serviceCode = data.serviceCode;
    this.voyageNumber = data.voyageNumber;
    this.direction = data.direction;
    this.cargo = '';
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

    if (bid) {
      this.shipperName = data.shipperName;
      this.controlParty = data.consigneeName;
      this.refBookingId = data.refBookingId;
      this.routeInfo = this.convertJson(data.routeInfo);
      this.capacityLight.color = data.capacityLightStatus;
      this.capacityLight.notes = data.capacityLightNotes;
      this.comments = data.remarks;
      /** CARGOS */
      data.cargo.forEach(cargo => {
        let cargoItem = new Cargo();
        cargoItem.container = cargo.container;
        cargoItem.sequenceId = cargo.sequenceId;
        cargoItem.bulk = cargo.bulk;

        const cType = cargo.equipSize + '' + cargo.equipType;
        for (const type of equipment) {
          for (const value of type.values) {
            if (cType === value.label) {
              cargoItem.cargoType = value;
            }
          }
        }

        if (!cargoItem.cargoType) {
          let bb = {
            label: 'Break bulk',
            description: ''
          };
          cargoItem.cargoType = bb;
        }

        cargoItem.commodityType = cargo.commodityType;
        cargoItem.hazClass = cargo.hazClass;
        cargoItem.unNumber = cargo.unNumber;
        cargoItem.numberOfUnits = cargo.numberOfUnits;
        cargoItem.totalWeight = cargo.totalWeight;
        cargoItem.oogVisibility = oogContainers.includes(cType);
        cargoItem.oog = cargo.oog;
        cargoItem.oogDetails = {
          overHeightBy: cargo.oogDetails.overHeightBy,
          overWidthBy: cargo.oogDetails.overWidthBy,
          overLengthBy: cargo.oogDetails.overLengthBy
        };
        cargoItem.dimensions = {
          height: cargo.dimensions.height,
          width: cargo.dimensions.width,
          length: cargo.dimensions.length
        };
        if (cargoItem.bulk) {
          cargoItem.volume =
            Number(cargoItem.dimensions.height) *
            Number(cargoItem.dimensions.width) *
            Number(cargoItem.dimensions.length);
        }
        cargoItem.description = cargo.description;
        this.cargoDetails.push(cargoItem);
      });
      /** END CARGOS */
    } else {
      this.voyageNumber = data.voyageNumber.slice(0, -1);
      this.direction = data.voyageNumber[data.voyageNumber.length - 1];
    } /* booking id end */
  }

  public convertJson(str) {
    try {
      var json = JSON.parse(str);
      return json;
    } catch (e) {
      return [];
    }
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

class Cargo {
  sequenceId: any;
  container: boolean;
  cargoType: any;
  bulk: boolean;
  cargo: { equipType: ''; equipSize: '' };
  commodityType: string;
  hazClass: string;
  unNumber: string;
  numberOfUnits: string;
  totalWeight: number;
  oogVisibility: boolean = false;
  oog: boolean = false;
  oogDetails: any = { overHeightBy: '', overWidthBy: '', overLengthBy: '' };
  dimensions: any = { height: '', width: '', length: '' };
  volume: number = 0;
  description: string;
  cubicMeasurement: string;
  files = [];
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
