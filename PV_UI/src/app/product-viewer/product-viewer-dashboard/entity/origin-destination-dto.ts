export class OriginDestinationDto {
    // portCode: string;
    // portName: string;
    // countryName: string;
    countries: Country[];
}
export class Country {
    countryName: string;
    countryCode: string;
    type: string;
    iCityCount: number;
    iPortCount: number;
    cities: City[];
}
export class City {
    cityCode: string;
    cityName: string;
    countryCode: string;
    iPortCount: number;
}
