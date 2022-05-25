import { IJsonData } from 'src/app/shared/interfaces/ijson-data';

export class TrafficStatus implements IJsonData {
  public serviceCode: string;
  public serviceName: string;
  public vesselCode: string;
  public vesselName: string;
  public voyageNumber: string;
  public portCode: string;
  public portName: string;
  public departureDate: string;
  public pdfUrl: string;
  public arrivalDate: string;
  public trafficStatus: string;
  public notes: string;
  public direction: string;

  public toJson(): JSON {
    const data: any = {
      portCode: this.portCode,
      voyageNumber: this.voyageNumber.slice(0, -1),
      vesselCode: this.vesselCode,
      deptDate: this.departureDate,
      capacityTrafficStatus: this.trafficStatus ? this.trafficStatus : '',
      vesselName: this.vesselName,
      notes: this.notes ? this.notes : '',
      direction: this.voyageNumber[this.voyageNumber.length - 1],
      serviceCode: this.serviceCode
    };
    return data;
  }
}
