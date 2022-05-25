import { IJsonData } from 'src/app/shared/interfaces/ijson-data';
import { formatDate } from '@angular/common';
export class Pricing implements IJsonData {
  countryGroup: any = {};

  public toJson(): JSON {
    let data;
    return data;
  }

  public setPricing(data: any, countries, allCountries, customerData?: any): any {
    this.countryGroup = {};
    for (const item of data) {
      let product = new Product();
      product = item;
      product.customer = {
        customerName: product.customerName,
        customerCode: product.customerCode
      };
      product.validityEnd = new Date(item.validityEnd);
      product.validityStart = new Date(item.validityStart);
      product.chargeType = product.customerName ? 'Contract' : 'Tariff';
      product.valid = this.getValidDateInfo(
        product.validityStart,
        product.validityEnd
      );
      if (product.valid === 'Expire') {
        product.editable = {
          chargeType: false,
          surcharge: false,
          quantity: false,
          uom: false,
          pricing: false,
          currency: false,
          startdate: false,
          enddate: false
        };
      } else if (product.valid === 'Future') {
        product.editable = new Editable();
      } else if (product.valid === 'Effective') {
        product.editable = {
          chargeType: false,
          surcharge: false,
          quantity: false,
          uom: false,
          pricing: false,
          currency: false,
          startdate: false,
          enddate: true
        };
      }

      if (customerData) {
        product.customers = customerData[item.countryCode];
      }
      let cntry = allCountries.find(c => c.countryCode === item.countryCode);
      product.localCurrency = cntry.currency ? cntry.currency : 'Local';
      
      if (this.countryGroup[item.countryCode]) {
        this.countryGroup[item.countryCode].name = item.countryName;
        this.countryGroup[item.countryCode].surcharge.push(product);
      } else {
        this.countryGroup[item.countryCode] = {};
        this.countryGroup[item.countryCode]['surcharge'] = [product];
        this.countryGroup[item.countryCode].name = item.countryName;
        this.countryGroup[item.countryCode].display = product.display;
      }
    }
    const countriesWithoutData = countries.filter(
      x => data.findIndex(r => x.countryCode === r.countryCode) == -1
    );

    for (const country of countriesWithoutData) {
      let product = this.createNewProduct(country,allCountries, customerData, 'new');
      this.countryGroup[country.countryCode] = {};
      this.countryGroup[country.countryCode]['surcharge'] = [product];
      this.countryGroup[country.countryCode].name = country.countryName;
      this.countryGroup[country.countryCode].display = false;
    }
  }

  public savePricing(surcharges: any, user): any {
    let allSurcharges = [];
    for (const data of surcharges) {
      console.log(data);
      let item = new Product();
      if (data.id) {
        item.id = data.id;
      }
      item.countryCode = data.countryCode;
      item.priceSurcharge = data.priceSurcharge;
      item.quantityValue = data.quantityValue;
      item.price = data.price;
      item.priceCurrency = data.priceCurrency;
      item.cost = data.cost;
      item.costCurrency = data.costCurrency;
      item.validityStart = formatDate(
        data.validityStart,
        'yyyy-MM-dd',
        'en-US'
      );
      item.validityEnd = formatDate(data.validityEnd, 'yyyy-MM-dd', 'en-US');
      item.lastUpdatedBy = user.userClaims.email;
      item.priceUom = data.priceUom;
      item.priceQuantity = data.priceQuantity;
      item.display = data.display;
      item.customerName = data.customer?.customerName;
      item.customerCode = data.customer?.customerCode;
      item.countryName = data.countryName;
      allSurcharges.push(item);
    }
    console.log(allSurcharges);
    return allSurcharges;
  }

  public createNewProduct(country,allCountries, customerData?: any, type?: string): Product {
    let startDate = new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000);
    let endDate = new Date(new Date().getTime() + 91 * 24 * 60 * 60 * 1000);
    const product = new Product();
    product.chargeType = 'Tariff';
    product.countryCode = country.countryCode;
    product.priceSurcharge = new PriceSurcharge();
    let priceQuantity = new PriceQuantity();
    priceQuantity.id = 1;
    priceQuantity.name = 'Up to';
    product.priceQuantity = priceQuantity;
    product.quantityValue = null;
    product.price = null;
    product.priceCurrency = 'USD';
    product.cost = null;
    product.costCurrency = 'USD';
    product.customer = {};
    product.customerName = '';
    product.customerCode = '';
    product.validityEnd = formatDate(endDate, 'yyyy-MM-dd', 'en-US');
    product.validityStart = formatDate(startDate, 'yyyy-MM-dd', 'en-US');
    product.display = type === 'add' ? true : false;
    product.valid = this.getValidDateInfo(
      product.validityStart,
      product.validityEnd
    );
    product.editable = new Editable();
    if (customerData) {
      product.customers = customerData[country.countryCode];
    }
    let cntry = allCountries.find(c => c.countryCode === country.countryCode);
    product.localCurrency = cntry.currency ? cntry.currency : 'Local';  
    return product;
  }

  public deleteSurcharge(index: number, key: string): void {
    let country = this.countryGroup[key];
    country.surcharge.splice(index, 1);
  }

  public getValidDateInfo(start, end) {
    let currentDate = new Date();
    let isFuture = start > currentDate ? true : false;
    let isPast = end < currentDate ? true : false;
    let isEffective = start <= currentDate && end > currentDate ? true : false;
    if (isFuture) {
      return 'Future';
    } else if (isPast) {
      return 'Expire';
    } else if (isEffective) {
      return 'Effective';
    }
  }
}
class Product {
  id: string;
  chargeType: string;
  countryCode: string;
  priceSurcharge: PriceSurcharge;
  priceQuantity: PriceQuantity;
  quantityValue: number;
  price: number;
  priceCurrency: string;
  cost: number;
  costCurrency: string;
  validityEnd: any;
  validityStart: any;
  lastUpdated: any;
  lastUpdatedBy: string;
  priceUom: PriceUom;
  display: boolean;
  countryName: string;
  customer: any;
  customerName: string;
  customerCode: string;
  valid: string;
  customers: [];
  editable: Editable;
  localCurrency: string;
}

class PriceSurcharge {
  code: string;
  name: string;
}

class PriceQuantity {
  id: number;
  name: string;
  isDefault: boolean;
}

class PriceUom {
  id: number;
  name: string;
}

class Editable {
  chargeType: boolean = true;
  surcharge: boolean = true;
  quantity: boolean = true;
  uom: boolean = true;
  pricing: boolean = true;
  currency: boolean = true;
  startdate: boolean = true;
  enddate: boolean = true;
}
