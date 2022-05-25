import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';

@Component({
  selector: 'app-search-country',
  templateUrl: './search-country.component.html',
  styleUrls: ['./search-country.component.scss']
})
export class SearchCountryComponent implements OnInit {
  private _countryList;
  public searchname;
  public initialized = false;
  public favouriteId;
  @Input()
  get countryList() {
    return this._countryList;
  }
  set countryList(list) {
    if (list) {
      this._countryList = list;
      this.processCountryList();
    }
  }

  @Output() public addFavourites = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}
  public processCountryList(): void {
    this.searchname = '';
    for (const key in this.countryList) {
      if (this.countryList.hasOwnProperty(key)) {
        const element = this.countryList[key];
        this.countryList[key].show = true;
        for (const item of this.countryList[key]) {
          item.show = true;
        }
        this.setAllFavouritesData(element);
      }
    }
    setTimeout(() => {
      const elmnt = document.getElementById(this.favouriteId);
      if (elmnt) {
        elmnt.scrollIntoView({
          behavior: 'auto',
          block: 'center'
        });
        this.favouriteId = '';
      }
    }, 100);
  }

  public addToFavourites(country: string, port: any, type: string): void {
    const fav = port.favourites ? false : true;
    const favType = fav ? 'insert' : 'delete';
    port.favourites = fav;
    const ports = this.countryList[country];
    this.setAllFavouritesData(ports);
    const details = {
      portCodes: [port.portCode],
      operation: favType
    };
    this.favouriteId = 'fav-' + port.portName;
    this.addFavourites.emit(details);
  }

  public countryToFavourites(country: any): void {
    const portCode = [];
    let favType;
    if (
      country.value.className === AppConstants.FAVOURITES_STAR_FILL ||
      country.value.className === AppConstants.FAVOURITES_STAR_HALF
    ) {
      favType = 'delete';
      for (const value of country.value) {
        if (value.favourites) {
          value.favourites = false;
          portCode.push(value.portCode);
        }
      }
    } else {
      favType = 'insert';
      country.value.forEach(port => {
        port.favourites = true;
        portCode.push(port.portCode);
      });
    }
    this.setAllFavouritesData(country.value);
    const details = {
      portCodes: portCode,
      operation: favType
    };
    this.favouriteId = 'fav-' + country.key;
    this.addFavourites.emit(details);
  }

  public setAllFavouritesData(data): void {
    const checkAllPorts = data.every(_item => _item.favourites === true);
    if (checkAllPorts) {
      data.className = AppConstants.FAVOURITES_STAR_FILL;
    } else {
      const count = data.filter(obj => obj.favourites === true).length;
      data.className =
        count === 0
          ? AppConstants.FAVOURITES_STAR_LINE
          : AppConstants.FAVOURITES_STAR_HALF;
    }
  }

  public searchUpdate(): void {
    for (const key in this.countryList) {
      if (this.countryList.hasOwnProperty(key)) {
        const element = this.countryList[key];
        const serachValue = key.toLowerCase();
        const incl = serachValue.includes(this.searchname.toLowerCase());
        for (const item of element) {
          item.show = true;
        }
        if (incl) {
          element.show = true;
        } else {
          for (const item of element) {
            const portInc = item.portCode
              .toLowerCase()
              .includes(this.searchname.toLowerCase());
            item.show = portInc ? true : false;
          }
          const isPort = element.find(port => port.show === true);
          element.show = isPort ? true : false;
        }
      }
    }
  }
}
