import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { Utils } from 'src/app/common/utilities/Utils';
import { DataService } from 'src/app/data.service';
import { KeycloakAdminService } from '../../services/keycloak.admin.service';
import { AddNewDlComponent } from '../add-new-dl/add-new-dl.component';

@Component({
  selector: 'app-delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss']
})
export class DeliveryListComponent implements OnInit {
  constructor(
    private keycloakService: KeycloakAdminService,
    private dataService: DataService,
    public dialog: MatDialog
  ) {}
  public availableContriesSelected = [];
  public associatedCountriesSelected = [];
  public availableUsersSelected = [];
  public associatedUsersSelected = [];
  public isChanged = false;

  public selectedDL = 'default';
  public deliveryLists = [];
  public availableCountries = [];
  public associatedCountries = [];
  public availableUsers = [];
  public associatedUsers = [];
  private originalKcDlCountriesMapping = {};
  private originalCountries = [];
  private originalKcTotalUsers = [];
  private originalKcDlUsersMapping = [];
  public dlChanged() {
    console.log('------', this.selectedDL);
    if (this.selectedDL === 'default') {
      this.associatedCountries = [];
      this.availableCountries = [];
      this.availableUsers = [];
      this.associatedUsers = [];
      return;
    }
    let assocCountries = this.originalKcDlCountriesMapping[this.selectedDL];
    this.associatedCountries = this.getAssociatedCountriesObjects(
      assocCountries
    );
    this.availableCountries = this.getAvailableCountries(assocCountries);

    let assocUsers = this.originalKcDlUsersMapping[this.selectedDL];
    this.associatedUsers = this.getAssociatedUsersObjects(assocUsers);
    this.availableUsers = this.getAvailableUsers(assocUsers);
  }
  ngOnInit(): void {
    forkJoin([
      this.keycloakService.getEmailDeliveryListCountriesFromKeycloak(),
      this.dataService.getPortListForScheduleSearch(),
      this.keycloakService.getEmailDeliveryListFromKeycloak(),
      this.keycloakService.getUsersFromKeycloak()
    ]).subscribe(r => {
      let [
        kcDlCountriesMapping,
        totalAvailableCountries,
        keycloakDLUsersMapping,
        keycloakTotalUsers
      ] = r;
      // console.log('response..........', r);
      this.originalCountries = Utils.processCountryData(
        totalAvailableCountries
      );
      this.originalKcDlCountriesMapping = kcDlCountriesMapping;
      this.deliveryLists = [...Object.keys(keycloakDLUsersMapping)];
      this.originalKcTotalUsers = keycloakTotalUsers;
      this.originalKcDlUsersMapping = keycloakDLUsersMapping;
    });
  }
  private getAvailableCountries(countries: string[]) {
    if (!countries || countries.length == 0) {
      return [...this.originalCountries];
    }
    return this.originalCountries.filter(
      tc => !countries.includes(tc.countryCode)
    );
  }

  private getAvailableUsers(users: string[]) {
    if (!users || users.length == 0) {
      return [...this.originalKcTotalUsers.filter(f => f.email)];
    }
    return this.originalKcTotalUsers
      .filter(f => f.email)
      .filter(
        tc => !users.some(u => tc.email.toLowerCase() === u.toLowerCase())
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

  private getAssociatedUsersObjects(users: string[]) {
    console.log('usersusers', users);
    if (!users || users.length == 0) {
      return [];
    }
    return this.originalKcTotalUsers
      .filter(f => f.email)
      .filter(tc => users.some(u => tc.email.toLowerCase() === u.toLowerCase()))
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
  public addUsers() {
    this.isChanged = true;
    this.availableUsers = this.availableUsers.filter(
      au =>
        !this.availableUsersSelected.some(
          acc => acc.email.toLowerCase() === au.email.toLowerCase()
        )
    );
    this.associatedUsers = [
      ...this.associatedUsers,
      ...this.availableUsersSelected
    ];
    this.availableUsersSelected = [];
  }
  public removeUsers() {
    this.isChanged = true;
    this.associatedUsers = this.associatedUsers.filter(
      ac =>
        !this.associatedUsersSelected.some(
          acc => acc.email.toLowerCase() === ac.email.toLowerCase()
        )
    );
    this.availableUsers = [
      ...this.availableUsers,
      ...this.associatedUsersSelected
    ].sort((a, b) => (a.email < b.email ? -1 : a.email == b.email ? 0 : 1));
    this.associatedUsersSelected = [];
  }
  saveChanges() {
    const postParams = {};

    this.originalKcDlCountriesMapping[
      this.selectedDL
    ] = this.associatedCountries.map(ac => ac.countryCode);

    this.originalKcDlUsersMapping[this.selectedDL] = this.associatedUsers.map(
      au => au.email
    );
    postParams[
      'emailDeliveryListsCountries'
    ] = this.originalKcDlCountriesMapping;
    postParams['emailDeliveryLists'] = this.originalKcDlUsersMapping;
    console.log('after Processing', postParams);
    this.keycloakService.saveAttributesToKeycloak(postParams).subscribe(s => {
      console.log('success', s);
      alert('Saving to keycloak successful...');
    });
  }
  public addNewDl() {
    const dialogRef = this.dialog.open(AddNewDlComponent, {
      width: '616px',
      data: {},
      scrollStrategy: new NoopScrollStrategy()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deliveryLists.push(result);
        this.selectedDL = result;
        this.associatedCountries = [];
        this.associatedUsers = [];
        this.associatedCountries = this.getAssociatedCountriesObjects([]);
        this.availableCountries = this.getAvailableCountries([]);

        this.associatedUsers = this.getAssociatedUsersObjects([]);
        this.availableUsers = this.getAvailableUsers([]);
      }
    });
  }
}
