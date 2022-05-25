import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Utils } from 'src/app/common/utilities/Utils';
import { DataService } from 'src/app/data.service';
import { KeycloakAdminService } from '../../services/keycloak.admin.service';

@Component({
  selector: 'app-user-country',
  templateUrl: './user-country.component.html',
  styleUrls: ['./user-country.component.scss']
})
export class UserCountryComponent implements OnInit {
  public totalKcUsers = [];
  public originalCountries = [];
  public availableCountries = [];
  public associatedCountries = [];
  public kcUsersWithCountryMapping = {};
  public kcDLWithCountryMapping = {};
  public kcDLWithUserMapping = {};
  public availableContriesSelected = [];
  public associatedCountriesSelected = [];
  public selectedDL = 'default';
  public isChanged = false;
  constructor(
    private keycloakService: KeycloakAdminService,
    private dataService: DataService
  ) {}
  public dlChanged() {
    console.log('------', this.selectedDL);
    if (this.selectedDL === 'default') {
      this.associatedCountries = [];
      this.availableCountries = [];
      return;
    }
    let assocCountries = this.kcUsersWithCountryMapping[this.selectedDL];
    this.associatedCountries = this.getAssociatedCountriesObjects(
      assocCountries
    );
    const dlInWhichUserIsPresent = [];
    let uniqueCountriesAssociatedWithDLs = [];
    Object.keys(this.kcDLWithUserMapping)
      .filter(dl =>
        this.kcDLWithUserMapping[dl].some(
          e => e.toLowerCase() === this.selectedDL.toLowerCase()
        )
      )
      .forEach(dl =>
        uniqueCountriesAssociatedWithDLs.push(
          ...this.kcDLWithCountryMapping[dl]
        )
      );
    uniqueCountriesAssociatedWithDLs = uniqueCountriesAssociatedWithDLs.filter(
      (item, i, ar) => ar.indexOf(item) === i
    );
    this.availableCountries = this.getAvailableCountries(
      assocCountries,
      uniqueCountriesAssociatedWithDLs
    );
  }
  private getAvailableCountries(
    countries: string[],
    uniqueCountriesAssociatedWithDLs
  ) {
    const countriesToBeConsidered = this.originalCountries.filter(
      oc => uniqueCountriesAssociatedWithDLs.indexOf(oc.countryCode) > -1
    );
    if (!countries || countries.length == 0) {
      return [...countriesToBeConsidered];
    }
    return countriesToBeConsidered.filter(
      tc => !countries.includes(tc.countryCode)
    );
  }

  private getAssociatedCountriesObjects(countries: string[]) {
    if (!countries || countries.length == 0) {
      return [];
    }
    return this.originalCountries
      .filter(tc => countries.includes(tc.countryCode))
      .sort();
  }
  public addCountries() {
    this.isChanged = true;
    this.availableCountries = this.availableCountries.filter(
      ac =>
        !this.availableContriesSelected.some(
          acc => acc.countryCode === ac.countryCode
        )
    );
    this.associatedCountries = [
      ...this.associatedCountries,
      ...this.availableContriesSelected
    ];
    this.availableContriesSelected = [];
  }
  public removeCountries() {
    this.isChanged = true;
    this.associatedCountries = this.associatedCountries.filter(
      ac =>
        !this.associatedCountriesSelected.some(
          acc => acc.countryCode === ac.countryCode
        )
    );
    this.availableCountries = [
      ...this.availableCountries,
      ...this.associatedCountriesSelected
    ].sort((a, b) =>
      a.countryCode < b.countryCode
        ? -1
        : a.countryCode == b.countryCode
        ? 0
        : 1
    );
    this.associatedCountriesSelected = [];
  }
  ngOnInit(): void {
    forkJoin([
      this.keycloakService.getUsersFromKeycloak(),
      this.keycloakService.getUserCountriesFromKeycloak(),
      this.dataService.getPortListForScheduleSearch(),
      this.keycloakService.getEmailDeliveryListCountriesFromKeycloak(),
      this.keycloakService.getEmailDeliveryListFromKeycloak()
    ]).subscribe(r => {
      console.log('r', r);
      const [
        totalUsers,
        userCountries,
        totalAvailableCountries,
        dlCountries,
        dlUsers
      ] = r;
      this.originalCountries = Utils.processCountryData(
        totalAvailableCountries
      );
      this.totalKcUsers = totalUsers;
      this.kcUsersWithCountryMapping = userCountries;
      this.kcDLWithCountryMapping = dlCountries;
      this.kcDLWithUserMapping = dlUsers;
    });
  }
  saveChanges() {
    const postParams = {};

    this.kcUsersWithCountryMapping[
      this.selectedDL
    ] = this.associatedCountries.map(ac => ac.countryCode);

    postParams['usercountries'] = this.kcUsersWithCountryMapping;

    console.log('after Processing', postParams);
    this.keycloakService.saveAttributesToKeycloak(postParams).subscribe(s => {
      console.log('success', s);
      alert('Saving to keycloak successful...');
    });
  }
}
