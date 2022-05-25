import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { DataService } from 'src/app/data.service';
import { OriginDestinationDto } from './entity/origin-destination-dto';
import { SearchProduct } from './entity/search-product';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, filter, distinctUntilChanged } from 'rxjs/operators';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { ProductList } from './entity/product-list';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';


import { MatSelectChange, MatSelect } from '@angular/material/select';

// For Demo
export class OriginDestination {
  portCode: string;
  portName: string;
  countryName: string;
  portCountryName: string;
}

@Component({
  selector: 'app-product-viewer-dashboard',
  templateUrl: './product-viewer-dashboard.component.html',
  styleUrls: ['./product-viewer-dashboard.component.scss']
})
export class ProductViewerDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public ngOnDestroy() {
    while (this.subscriptionArray.length > 0) {
      this.subscriptionArray.pop().unsubscribe();
    }
  }
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;
  @ViewChild('productFilter') productFilter: MatSelect;
  @ViewChild('originPort') originPort: ElementRef;
  private subscriptionArray: Subscription[] = [];
  private currentlySelectedRow: number = 0;
  public readonly GRAY_UP = '../../../assets/icons/gray_up/gray.png';
  public readonly DARK_GRAY_UP = '../../../assets/icons/dark_grey_up/gray.png';
  public readonly GRAY_DOWN = '../../../assets/icons/gray_down/gray.png';
  public readonly DARK_GRAY_DOWN =
    '../../../assets/icons/dark_grey_down/gray.png';
  public readonly BLUE_UP = '../../../assets/icons/up_arrow_blue/blue.png';
  public readonly BLUE_DOWN = '../../../assets/icons/down_arrow_blue/blue.png';
  readonly initialFilterValue = {
    value: 'transhipment',
    order: -1,
  };
  public currenrtlySelectedFilter: {
    value: string;
    order: number;
  } = { ...this.initialFilterValue };
  public upArrowSrc = [];
  public downArrowSrc = [];

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    // capture subscriptions. Unsubscribe on destroy
    this.subscriptionArray.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Trick the Router into believing it's last link wasn't previously loaded
          this.router.navigated = false;
        }
      })
    );
    this.getOriginDestList();
  }
  ngAfterViewInit(): void {
    this.timeOut();
  }
  originDestList: OriginDestination[];
  // For Demo
  searchProduct: SearchProduct;
  originCtrl = new FormControl();
  filteredOrigins$: Observable<OriginDestination[]>;
  destCtrl = new FormControl();
  filteredDest$: Observable<OriginDestination[]>;
  selectFormControl = new FormControl(this.currenrtlySelectedFilter.value);
  hideSearchButton = false;
  toHighlight: string = '';
  showData = false;
  destPortCode: any;
  destPortName: any;
  destCountryName: any;
  destPortCountryName: any;
  sameorigindesterror = false;
  validcheckflag = false;
  originPortCode: any;
  originPortName: any;
  originCountryName: any;
  originPortCountryName: any;
  showSearch = false;
  expandedOrNot = true;
  displayedColumns: string[] = ['Transhipment', 'NextDeparture', 'Frequency',
    'TransitTime', 'Schedule'];
  prodlist: ProductList[];

  allProducts: number = 0;

  sortFields = [{
    value: 'transhipment',
    viewValue: 'Transshipment'
  },
  {
    value: 'nextDeparture',
    viewValue: 'Next departure'
  },
  {
    value: 'frequency',
    viewValue: 'Frequency'
  },
  {
    value: 'transitTime',
    viewValue: 'Transit time'
  }];
  upArrowClass = [];
  downArrowClass = [];

  initialiseFilter() {
    this.currenrtlySelectedFilter = { ...this.initialFilterValue };
    this.sortFields.forEach((j, i) => {
      if (j.value === this.currenrtlySelectedFilter.value) {
        if (this.currenrtlySelectedFilter.order === 1) {
          this.upArrowSrc[i] = this.BLUE_UP;
          this.upArrowClass[i] = 'Blue';
          this.downArrowSrc[i] = this.GRAY_DOWN;
          this.downArrowClass[i] = 'Gray opac';
        } else {
          this.upArrowSrc[i] = this.GRAY_UP;
          this.upArrowClass[i] = 'Gray opac';
          this.downArrowSrc[i] = this.BLUE_DOWN;
          this.downArrowClass[i] = 'Blue';
        }
      } else {
        this.upArrowSrc[i] = this.GRAY_UP;
        this.downArrowSrc[i] = this.GRAY_DOWN;
        this.upArrowClass[i] = 'Gray opac';
        this.downArrowClass[i] = 'Gray opac';
      }
    });
  }
  ngOnInit(): void {
    this.searchProduct = new SearchProduct();
    this.initialiseFilter();
    this.subscriptionArray.push(
      this.originCtrl.valueChanges.subscribe((s) => {
        if (s && s.portCode) {
          const portValue = s.portCountryName.split(', ');
          if (portValue.length == 2) {
            this.originchange(s);
            this.populateSearchProduct(portValue, 'source');
          }
        }
      })
    );
    this.subscriptionArray.push(
      this.destCtrl.valueChanges.subscribe((s) => {
        if (s && s.portCode) {
          const portValue = s.portCountryName.split(', ');
          if (portValue.length == 2) {
            this.DestTypechange(s);
            this.populateSearchProduct(portValue, 'destination');
          }
        }
      })
    );
  }
  /**
   * Origin and Destination Lists are fetched
   * from backend
   */
  getOriginDestList() {
    this.dataService.getOriginDestList().subscribe(data => {
      this.originDestList = JSON.parse(JSON.stringify(data));
      for (let i = 0, len = this.originDestList.length; i < len; i += 1) {

        if (this.originDestList[i].portCode &&
          this.originDestList[i].portName &&
          this.originDestList[i].countryName) {
          this.originDestList[i].portCountryName = this.originDestList[i].portCode + '  ' + ' ' +
            this.originDestList[i].portName + ',' + ' ' + this.originDestList[i].countryName;
        } else {
          this.originDestList[i].portCountryName = this.originDestList[i].portCode + '  ' + ' ' +
            this.originDestList[i].portName;
        }
      }
      this.originDestList = this.uniq(this.originDestList, 'portCountryName');
      this.showData = true;
      console.log('this . states....', this.originDestList);
      if (this.originDestList !== undefined && this.originDestList != null) {
        this.filteredOrigins$ = this.originCtrl.valueChanges
          .pipe(
            startWith(''),
            distinctUntilChanged((x, y) =>
          this.distinctUntilChangedComparator(x, y)
        ),
            // this originCtrl can take string | OriginDestination type.
            // We need to highlight only when the value is string
            filter((s) => !s.portCode),
            map((origin) => this._filter(origin.trim(), 'source'))
          );
        this.filteredDest$ = this.destCtrl.valueChanges.pipe(
          startWith(''),
distinctUntilChanged((x, y) =>
          this.distinctUntilChangedComparator(x, y)
        ),
          filter((p) => !p.portCode),
          map((dest) => this._filter(dest.trim(), 'destination'))
        );
      }

    }, error => {
      console.log(error);
    });
  }
  toHighlightDest = '';
  private _filter(value, type): OriginDestination[] {
    // this.toHighlight = value;
    if (value != null) {
      const filterValue = value.toLowerCase();
      if (type == 'source') {
        this.toHighlight = value;
      } else {
        this.toHighlightDest = value;
      }
      return this.originDestList.filter(
        (origDest) =>
          origDest.portName.toLowerCase().indexOf(filterValue) === 0 ||
          origDest.portCode.toLowerCase().indexOf(filterValue) === 0 ||
          origDest.countryName.toLowerCase().indexOf(filterValue) === 0
      );
    } else {
      return [];
    }
  }
  disableSubmit = true;
  disableSearch = true;
  count = 0;
  validOriginPort = false;
  validDestPort = false;
  originchange(item) {
    console.log('origin=>' + item.portCountryName);
    this.validateOriginPort(item);

    this.originPortName = item.portName;
    this.originPortCode = item.portCode;
    this.originCountryName = item.countryName;
    this.originPortCountryName = item.portCountryName;
    this.OriginTypechange(item.portCode);
    this.validateOriginDestFields();
    if (item.portCountryName === undefined) {
      console.log('origin inside=>' + item.portCountryName);
      this.disableSubmit = true;
    } else if (this.showSearch && this.count >= 1 && item.portCountryName !== undefined) {
      console.log('inside if');
      this.disableSubmit = false;
      this.disableSearch = false;
    } else {
      this.disableSubmit = false;
      this.disableSearch = false;
    }
    if (this.originPortCountryName !== undefined && this.destPortCountryName !== undefined) {
      if (this.originPortCountryName === this.destPortCountryName) {
        this.sameorigindesterror = true;
        this.validOriginPort = false;
      }
      else {
        this.disableSearch = false;
        this.validOriginPort = false;
        this.sameorigindesterror = false;
      }
    }
  }
  validateOriginPort(item) {
    for (let origDest of this.originDestList) {
      if (item.portCode === origDest.portCode
        || item.portName === origDest.portName
        || item.countryName === origDest.countryName
        || item.portCountryName === origDest.portCountryName) {
        this.validOriginPort = false;
        this.sameorigindesterror = false;
        break;
      } else {
        this.validOriginPort = true;
        this.sameorigindesterror = false;
      }
    }
  }
  validateDestPort(item) {
    for (let origDest of this.originDestList) {
      if (item.portCode === origDest.portCode
        || item.portName === origDest.portName
        || item.countryName === origDest.countryName
        || item.portCountryName === origDest.portCountryName) {
        this.validDestPort = false;
        this.sameorigindesterror = false;
        break;
      } else {
        this.validDestPort = true;
        this.sameorigindesterror = false;

      }
    }
  }
  origin: any; destination: any;
  OriginTypechange(item) {
    if (item == undefined) {
      this.origin = "";
    }
    else {
      this.origin = item;
    }
  }
  disableSubmitForDest = true;
  DestTypechange(item: any) {
    console.log('dest=>' + item.portCountryName);
    this.validateDestPort(item);

    this.destPortCode = item.portCode;
    this.destPortName = item.portName;
    this.destCountryName = item.countryName;
    this.destPortCountryName = item.portCountryName;
    if (this.originPortCountryName !== undefined && this.destPortCountryName !== undefined) {
      if (this.originPortCountryName == this.destPortCountryName) {
        this.sameorigindesterror = true;
        this.validDestPort = false;
      }
      else {
        this.sameorigindesterror = false;
        this.validDestPort = false;
      }
    }
    this.validateOriginDestFields();
    if (item.portCountryName === undefined) {
      console.log('dest inside=>' + item.portCountryName);
      this.disableSubmitForDest = true;
    } else if (this.showSearch && this.count >= 1 && item.portCountryName !== undefined) {
      this.disableSubmitForDest = false;
      this.disableSearch = false;
    }
    else {
      this.disableSubmitForDest = false;
      this.disableSearch = false;

    }
  }
  uniq(a, param) {
    return a.filter(function (item, pos, array) {
      return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
    })
  }

  ShowProductList() {
    // For disabling the submit button
    this.disableSearch = true;
    // this.showSearch = true;
    //this.spinnerService.show();

    this.dataService.getProductList(this.searchProduct).subscribe(data => {

      this.prodlist = JSON.parse(JSON.stringify(data));
      // this.spinnerService.hide();

      /*let _allproducts: number = 0;
      for (let i = 0; i < this.prodlist.length; i++) {
        _allproducts += this.prodlist[i].totalRoutes;
        console.log('_allproducts', _allproducts);
      }*/
this.initialiseFilter();
      if (this.prodlist) {
        console.log('this.prodlist', this.prodlist);
        this.allProducts = this.prodlist.reduce(
          (a, v) => a + parseInt(v.totalRoutes + ''),
          0
        );
      }

      this.showSearch = true;
      //});

    });
  }


  validateOriginDestFields() {
    if (this.originCtrl.value != undefined && this.destCtrl.value != undefined) {
      this.validcheckflag = true;
      console.log(' this.validcheckflag ' + this.validcheckflag);

    } else {
      this.validcheckflag = false;
      console.log(' this.validcheckflag2 ' + this.validcheckflag);


    }
  }
  validateDestination() { }

  onSelectSort(filter: { value: string; order: number }, selectedRow: number) {
    if (filter.value == 'nextDeparture') {
      this.prodlist[selectedRow].subProducts.sort((i1, i2) =>
        this.nextdepartureSort(i1, i2, filter.order)
      );
    } else {
      this.prodlist[selectedRow].subProducts.sort((i1, i2) =>
        this.sortBasedOnProperty(i1, i2, filter.order, filter.value)
      );
    }
    this.prodlist[selectedRow].subProducts = [
      ...this.prodlist[selectedRow].subProducts,
    ];
  }

  sortBasedOnProperty(item1, item2, order: number, property: string) {
    let returnValue = 0;
    if (item1[property] == 'TBD' || item2[property] == 'TBD') {
      return 1;
    }
    if (item1[property] < item2[property]) {
      returnValue = -1;
    } else if (item1[property] > item2[property]) {
      returnValue = 1;
    } else {
      returnValue = 0;
    }
    return returnValue * order;
  }
  nextdepartureSort(item1, item2, order: number) {
    let returnValue = 0;
    if (item1['nextDeparture'] == 'TBD' || item2['nextDeparture'] == 'TBD') {
      return 1;
    }

    const d1: Date = new Date(item1['nextDeparture']);
    const d2: Date = new Date(item2['nextDeparture']);

    if (d1 < d2) {
      returnValue = -1;
    } else if (d1 > d2) {
      returnValue = 1;
    } else {
      returnValue = 0;
    }
    return returnValue * order;
  }
  sourceselected(event: MatAutocompleteSelectedEvent) {
    let portvalues = event.option.value.portCountryName.split(', ');
    this.populateSearchProduct(portvalues, 'source');
  }
  populateSearchProduct(portValues: string[], type: string) {
    let portcode = portValues[0].split('  ')[0];

    let portkode = portcode.startsWith('ALL');
    let portkodesize = portcode.length;
    if ((type === 'source')) {
      if (portkode && portkodesize == 5) {
        this.searchProduct.sourceName = portValues[1];
        this.searchProduct.sourceType = 'Country';
      }

      if (!portkode && portkodesize == 5) {
        this.searchProduct.sourceName = portValues[0].split('  ')[1].trim();
        this.searchProduct.sourceType = 'Port';
      }
    } else {
      if (portkode && portkodesize == 3) {
        this.searchProduct.destinationName = 'EVERYWHERE';
        this.searchProduct.destinationType = 'Country';
      } else if (portkode && portkodesize == 5) {
        this.searchProduct.destinationName = portValues[1];
        this.searchProduct.destinationType = 'Country';
      } else if (!portkode && portkodesize == 5) {
        this.searchProduct.destinationType = 'Port';
        this.searchProduct.destinationName = portValues[0]
          .split('  ')[1]
          .trim();
      }
    }
  }
  destselected(event: MatAutocompleteSelectedEvent) {
    let portvalues = event.option.value.portCountryName.split(', ');
    this.populateSearchProduct(portvalues, 'destination');
  }

  refreshData(index) {
    this.currentlySelectedRow = index;
    if (this.currenrtlySelectedFilter && this.currenrtlySelectedFilter.value) {
      this.onSelectSort(this.currenrtlySelectedFilter, index);
    }
  }
  /**
   * This functions calls the sorting function based on Up/Down arrow selection.
   */
  arrowClicked(event, value, type: string, index) {
    // if (type === 'up') {
    this.upArrowSrc.forEach((v, i) => {
      if (i === index && type === 'up') {
        this.upArrowSrc[i] = this.BLUE_UP;
        this.upArrowClass[i] = 'Blue';
      } else {
        this.upArrowSrc[i] = this.GRAY_UP;
        this.upArrowClass[i] = 'Gray opac';
      }
    });
    this.downArrowSrc.forEach((v, i) => {
      if (i === index && type === 'down') {
        this.downArrowSrc[i] = this.BLUE_DOWN;
        this.downArrowClass[i] = 'Blue';
      } else {
        this.downArrowSrc[i] = this.GRAY_DOWN;
        this.downArrowClass[i] = 'Gray opac';
      }
    });

    this.currenrtlySelectedFilter.order = type === 'up' ? 1 : -1;

    /** We stop event propagation as arrows are child of mat select options.
     * If we dont stop propagation, even the option click event will be fired.s
     */
    event.stopPropagation();
    this.currenrtlySelectedFilter.value = value;
    this.selectFormControl.setValue('');
    setTimeout(
      () =>
        this.selectFormControl.setValue(this.currenrtlySelectedFilter.value),
      5
    );
    this.onSelectSort(this.currenrtlySelectedFilter, this.currentlySelectedRow);
    this.productFilter.close();
  }
  /**
   * This functions calls the sorting function based with down arrow as selected.
   * This function in called when the options is clicked and not the arrows.
   */
  selectOptionClicked(event: MouseEvent, value, index) {
    this.arrowClicked(event, value, 'down', index);
  }
  mouseEvent($event, eventType: any, arrowType: string, i, value) {
    if (
      this.currenrtlySelectedFilter.value === value &&
      ((arrowType === 'up' && this.currenrtlySelectedFilter.order === 1) ||
        (arrowType === 'down' && this.currenrtlySelectedFilter.order === -1))
    ) {
      $event.stopPropagation();
      return;
    }
    if (arrowType === 'up' && eventType === 'mouseover') {
      this.upArrowSrc[i] = this.DARK_GRAY_UP;
      this.upArrowClass[i] = 'Gray';
      $event.stopPropagation();
    } else if (arrowType === 'up' && eventType === 'mouseout') {
      this.upArrowSrc[i] = this.GRAY_UP;
      this.upArrowClass[i] = 'Gray opac';
    }
    if (arrowType === 'down' && eventType === 'mouseover') {
      this.downArrowSrc[i] = this.DARK_GRAY_DOWN;
      this.downArrowClass[i] = 'Gray';
      $event.stopPropagation();
    } else if (arrowType === 'down' && eventType === 'mouseout') {
      this.downArrowSrc[i] = this.GRAY_DOWN;
      this.downArrowClass[i] = 'Gray opac';
    }
  }
  getViewValue(value: string): string {
    if (!value) return;
    return this.sortFields.find((s) => s.value === value).viewValue;
  }

  displayCustom(item) {
    if (!item) {
      return '';
    }

    return item.portCountryName;
  }
  timeOut() {
    setTimeout(() => {
      while (!this.originPort) {
        this.timeOut();
        return;
      }
      this.originPort.nativeElement.focus();
      console.log('focused');
    }, 100);
  }
  getValueOfText(type: string) {

    let v: any = '';

    if (type === 'destination') {

      v = this.destCtrl.value;

    } else {

      v = this.originCtrl.value;

    }

    let r = '';

    if (v && v.portCode) {

      r = v.portCode;

    } else {

      r = '';

    }

    return r;

  }
  private distinctUntilChangedComparator = (oldValue, newValue) => {
    if (oldValue && !oldValue.portCode && newValue && !newValue.portCode) {
      if (oldValue.trim().toLowerCase() === newValue.trim().toLowerCase) {
        return true;
      }
    }
    if (oldValue && !newValue) {
      this.showSearch = false;
    }
    return false;
  };
}
