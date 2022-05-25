import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Utils } from 'src/app/common/utilities/Utils';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor() {}
  public MAX_TRANSSHIPMENT = 4;
  public selectedCountries;
  public setScheduleData(data: any): void {
    if (data) {
      this.selectedCountries = data;
    }
  }
  public getScheduleData(): any {
    return this.selectedCountries;
  }

  public getScheduleDetails(response): any {
    const results = response;
    // const dataObject=[{portCode:''portName:'',vessel_id:{}}];
    const uniqService = this.uniqService('uniqueVessels', results);
    const originPorts = this.getUniqPorts(
      'originCountry',
      results,
      uniqService
    );
    const destinationPorts = this.getUniqPorts(
      'destinationCountry',
      results,
      uniqService
    );
    const transhipments = this.getTranshipments(results);
    const _totalPorts = [
      ...originPorts.serviceRouteMap,
      { transhipments },
      { destination_vessels: '' },
      ...destinationPorts.serviceRouteMap
    ];
    //  console.log('****', _totalPorts);
    return {
      totalPorts: _totalPorts,
      totalServices: uniqService,
      originPorts: originPorts.uniqports,
      destinationPorts: destinationPorts.uniqports,
      transhipments
    };
  }
  public getTranshipments(results) {
    const t = [];
    results.forEach((r, i) => {
      if (r.transhipments.length > 0) {
        t[i] = r.transhipments;
      }
    });
    return t;
  }
  public getUniqPorts(key, result, services) {
    const service = services;
    const ports = [];
    const uniqports = [];
    /*[...result]
      .sort((a, b) => {
        return (
          a['originCountry'].length +
          a['destinationCountry'] -
          (b['originCountry'].length + b['destinationCountry'])
        );
      })*/
    result.forEach((r, index) => {
      r[key].forEach(a => {
        let obj = {};
        const isTranshipPort =
          r.transhipments.findIndex(
            t => t.currentPort.portCode === a.portCode
          ) !== -1;
        if (isTranshipPort) {
          return;
        }
        if (uniqports.indexOf(a.portCode) === -1) {
          obj['portCode'] = a.portCode;
          obj['portName'] = a.portName;
          obj['services'] = service;
          obj['type'] = key;
          // obj['product']=index;
          ports.push(obj);
          uniqports.push(a.portCode);
        } else {
          obj = ports.filter(rr => rr.portCode === a.portCode)[0];
        }
        obj[index] = a;
        // obj['label'] = index;
        obj[index]['label'] = index;
        a['dArrival'] = formatDate(a.arrivalDate, 'dd LLL', 'en-US');
        a['dDeparture'] = formatDate(a.departureDate, 'dd LLL', 'en-US');
        a['duration'] =
          formatDate(a.arrivalDate, 'dd LLL', 'en-US') +
          ' - ' +
          formatDate(a.departureDate, 'dd LLL', 'en-US');
        // obj[index]
      });
      // console.log(r);
    });
    // console.log('uniqueports......', key, result, services);
    this.printAsteriksForPorts(ports, uniqports);
    // service

    const serviceRouteMap = this.processRouteMap(ports, key);

    return { serviceRouteMap, uniqports };
  }

  public filterRouteMap(originData) {
    const origin = originData.ports.filter(
      item => item.type === 'originCountry'
    );
    const destination = originData.ports.filter(
      item => item.type === 'destinationCountry'
    );
    for (const ports of origin) {
      if (ports.services && ports.services.length) {
        for (const service of ports.services) {
          delete service.previous;
          delete service.next;
          delete service.route;
          delete service.startRoute;
        }
      }
    }

    for (const ports of destination) {
      if (ports.services && ports.services.length) {
        for (const service of ports.services) {
          delete service.previous;
          delete service.next;
          delete service.route;
          delete service.startRoute;
        }
      }
    }
    const getTransshipments = originData.ports.find(item =>
      item.hasOwnProperty('transhipments')
    );
    const vessels = originData.ports.find(item =>
      item.hasOwnProperty('destination_vessels')
    );
    const originPortData = this.processRouteMap(origin, 'originCountry');
    const destinationPortData = this.processRouteMap(
      destination,
      'destinationCountry'
    );
    const _totalPorts = [
      ...originPortData,
      getTransshipments,
      vessels,
      ...destinationPortData
    ];
    return _totalPorts;
  }

  public processRouteMap(ports, key) {
    const portMap = ports.map(element => {
      for (const key in element) {
        if (
          element.hasOwnProperty(key) &&
          element[key] &&
          element[key].serviceCode
        ) {
          const _service = element.services.find(
            item => item.serviceCode === element[key].serviceCode
          );
          if (_service) {
            const serviceMap = element.services.map(_el => {
              if (_service.serviceCode === _el.serviceCode) {
                _el = { ..._el, route: true };
              }
              return _el;
            });
            element = { ...element, services: serviceMap };
          }
        }
      }
      return element;
    });

    const serviceRouteMap = portMap.map((el, index) => {
      const serviceMaps = el['services'].map(_services => {
        if (index === 0) {
          if (key === 'originCountry') {
            const hasRoute = _services.route ? true : false;
            _services = { ..._services, previous: false, startRoute: hasRoute };
          }
        }
        if (key === 'originCountry') {
          for (let i = 0; i < index; i++) {
            const checkPrevious = portMap[i]['services'].some(
              _it =>
                _it.serviceCode === _services.serviceCode && _it.route === true
            );
            if (checkPrevious) {
              _services = { ..._services, previous: true };
            } else {
              // const hasRoute = _services.route ? true : false;
              let prev = false;
              if (_services.previous) {
                prev = true;
              }
              _services = { ..._services, previous: prev };
            }
            //  }
          }

          for (let i = index + 1; i < portMap.length; i++) {
            const checkNext = portMap[i]['services'].some(
              _it =>
                _it.serviceCode === _services.serviceCode && _it.route === true
            );
            if (checkNext) {
              _services = { ..._services, next: true };
            } else {
              _services = { ..._services };
            }
          }
        } else {
          for (let i = index + 1; i < portMap.length; i++) {
            const checkNext = portMap[i]['services'].some(
              _it =>
                _it.serviceCode === _services.serviceCode && _it.route === true
            );
            if (checkNext) {
              _services = { ..._services, next: true };
            } else {
              _services = { ..._services };
            }
          }
        }
        _services = { ..._services };
        return _services;
      });
      el = { ...el, services: serviceMaps };
      return el;
    });

    return serviceRouteMap;
  }

  public uniqService(key, result) {
    const getAllServices = Utils.getServiceDetails();
    const uniqServices = [];
    result.forEach((r, index) => {
      r[key].forEach(a => {
        const obj = {};
        if (
          uniqServices.findIndex(_i => _i.serviceCode === a.service_code) === -1
        ) {
          const serviceDetails = getAllServices.find(
            _s => _s.serviceCode === a.service_code
          );
          if (serviceDetails) {
            obj['serviceCode'] = serviceDetails.serviceCode;
            obj['serviceName'] = serviceDetails.serviceName;
            obj['feeder'] = false;
          } else {
            obj['serviceCode'] = a.service_code;
            obj['serviceName'] = a.service_code + ' (Feeder)';
            obj['feeder'] = true;
          }
          uniqServices.push(obj);
        }
      });
    });
    return uniqServices;
  }

  public getCommonServices(_origin, _destination, _services): any {
    const originServices = [];
    const destinationServices = [];
    for (const ports of _origin) {
      for (const service of ports.services) {
        if (service.route) {
          originServices.push(service.serviceCode);
        }
      }
    }
    for (const ports of _destination) {
      for (const service of ports.services) {
        if (service.route) {
          destinationServices.push(service.serviceCode);
        }
      }
    }

    const intersection = originServices.filter(_o =>
      destinationServices.includes(_o)
    );
    const mergeOrginDestinatination = originServices.concat(
      destinationServices
    );
    const _transshipmentOnly = _services.filter(
      value => !mergeOrginDestinatination.includes(value.serviceCode)
    );
    const services = intersection.filter(
      (item, index) => intersection.indexOf(item) === index
    );
    return {
      transshipmentOnly: _transshipmentOnly,
      commonServices: services,
      destinationService: destinationServices,
      originService: originServices
    };
  }

  public uniqueTransshipments(data: any): any {
    const uniq = [];
    data.forEach(element => {
      for (const item of element) {
        if (item && item.previousPort && item.currentPort) {
          const _service =
            item.currentPort.serviceCode + '-' + item.previousPort.serviceCode;
          const isAvailable = uniq.find(_s => _s === _service);
          if (!isAvailable) {
            uniq.push(_service);
          }
        }
      }
    });
    return uniq.length;
  }
  private printAsteriksForPorts(ports, uniqports) {
    /** ports array is already sorted in the order in which they are to be displayed on UI */
    ports.map((port, index) => {
      if (index === 0) {
        /** Can't compare previous element for 1st row i.e. index 0 */
        return;
      }
      /** port object is an object with column index as keys. */
      Object.keys(port).forEach(productKey => {
        if (isNaN(parseInt(productKey, 10))) {
          /** all non numric indices are not columns for the product */
          return;
        }
        /** this is the current departure date */
        const currentDepDate = new Date(
          port[productKey].departureDate
        ).getTime();
        let tempIndex = index;
        /** we iterate all previous occurences of this index in earlier rows */
        do {
          tempIndex--; // previous rows
          if (ports[tempIndex][productKey]) {
            /** There is a port halt at an earlier row for the product of productKey
             * We take that date
             */
            const loopDepDate = new Date(
              ports[tempIndex][productKey].departureDate
            ).getTime();
            /** Check if the current Date is less then the date at previous row. */
            if (currentDepDate - loopDepDate < 0) {
              /** If yes, we add * and then break the loop  */
              port[productKey].dDeparture = port[productKey].dDeparture + '  *';
              port[productKey].dArrival = port[productKey].dArrival + '  *';
              port[productKey].duration = port[productKey].duration + '  *';

              break;
            }
          }
        } while (tempIndex > 0);
      });
      return port;
    });
  }
}
