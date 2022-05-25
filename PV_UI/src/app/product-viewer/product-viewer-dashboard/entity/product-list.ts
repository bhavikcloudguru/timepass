

export class SubProduct {
    
    transhipment:string;
    nextDeparture:string;
    frequency:string;
    TransitTime:string;
}

export class ProductList {

    totalRoutes:number;
    destinationPortName:string;
    destinationPortCode:string;
    destinationcountryName:string;
    route:string;
    subProducts:SubProduct[];
}