import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  OnDestroy,
  HostListener,
  ViewChildren
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { Utils } from 'src/app/common/utilities/Utils';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AppConstants } from 'src/app/shared/app-constants/app-constants.model';
import { MatExpansionPanel } from '@angular/material/expansion';
import { FeedbackComponent } from 'src/app/shared/components/feedback/feedback.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** this is a dumb component. This is used to display the results and sort button */
export class ResultsComponent implements OnInit, OnDestroy {
  /** This subject will be used to unsubscribe all observables in this component */
  destroy$: Subject<boolean> = new Subject<boolean>();
  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected = false;

  @Input() public showResults: boolean;
  @Input() public searchData: any;
  @Input() public set schedules(v: any[]) {
    this.items = v;
    this.items.forEach(item => {
      item.pairWiseDetails = this.getPairwiseDetails(item);
      item.isPartial = this.checkCo2Data(item.pairWiseDetails);
    });
    if (this.isAllSelected) {
      this.items.forEach(i => this.selection.select(i));
    }
    this.totalSelected = this.selection.selected.length;
  }

  public get schedules(): any[] {
    return this.items;
  }
  @Input() public todayDate: Date;
  @Input() public errorStatus: string;
  @Input() public sortByFilterList: { view: string; value: string }[];
  @Input() public initialFilterValue;
  @Input() public set currenrtlySelectedFilter(a: {
    value: string;
    order: number;
  }) {
    this._currenrtlySelectedFilter = a;
    // On change of filter, close all the expansion panels to avoid mis rendering
    if (this.matExpPanel) {
      this.matExpPanel.forEach(ep => ep.close());
      this.currentlyOpenedPanel = [];
    }
  }
  public get currenrtlySelectedFilter(): { value: string; order: number } {
    return this._currenrtlySelectedFilter;
  }
  private _currenrtlySelectedFilter: { value: string; order: number };

  private _showLoading: boolean;
  public currentlyOpenedPanel = []; // this holds the index of currently open panel
  @Input() public set showLoading(b: boolean) {
    this._showLoading = b;
    if (b) {
      this.isAllSelected = false;
      this.currentlyOpenedPanel = [];
    }
  }
  public get showLoading(): boolean {
    return this._showLoading;
  }
  public currentPosition: string = AppConstants.ABS_POSITION;

  /** Total results available. Due to infinite scroll, we dont send entire data at the same time. */
  @Input() public totalResults = 0;
  @Input() public selection: SelectionModel<any>; // = new SelectionModel<any>(true, []);

  @Output() public arrow = new EventEmitter();
  @Output() public scrolled = new EventEmitter();
  @Output() public openExportDialog = new EventEmitter<{
    selectedRecords: any[];
    comp: string;
  }>();
  private _cargoWt = 0;
  @Input() public set cargoWt(c) {
    this._cargoWt = c;

    this.items.forEach(item => {
      item.isPartial = this.checkCo2Data(item.pairWiseDetails);
    });
  }
  public get cargoWt() {
    return this._cargoWt;
  }

  private _cargoVolumeOption;
  @Input() public set cargoVolumeOption(op) {
    this._cargoVolumeOption = op;
  }
  public get cargoVolumeOption(): any {
    return this._cargoVolumeOption;
  }

  @ViewChildren('matExpPanel', { read: MatExpansionPanel })
  matExpPanel: MatExpansionPanel[];

  /** Date format string for results */
  public readonly dateFormat = 'dd LLL yyyy';
  /** this used to hold schedules being passed to this component */
  public items = [];

  public totalSelected = 0;

  @HostListener('body:scroll', ['$event'])
  onWindowScroll(event: any) {
    const elm = document.getElementById('sticky-position');
    if (elm) {
      const screenPosition = elm.getBoundingClientRect();

      this.currentPosition =
        screenPosition.top < 50
          ? AppConstants.FIXED_POSITION
          : AppConstants.ABS_POSITION;

      if (event.target.offsetHeight - event.target.scrollTop <= 50) {
        // prevent scroll jump . Parent position is relative.
        if (screenPosition.top < 100 && screenPosition.top > -100) {
          this.currentPosition = AppConstants.FIXED_POSITION;
        }
        this.scrolled.emit(event);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}
  /** EMit the scroll event to parent for further actions */
  public scrll(e) {
    this.scrolled.emit(e);
  }
  /** get array of pairs of portpair details for each schedule */
  public getPairwiseDetails(item) {
    const returnObject = [];
    for (let i = 0; i < item.portPairList.length - 1; i += 2) {
      const obj = {};
      obj['first'] = item.portPairList[i];
      obj['first'].serviceCode = item.portPairList[i].serviceCode;
      obj['first'].medianCo2Nz = item.medianCo2Nz;
      /*Utils.getServiceCodeFromServiceName(
        item.portPairList[i].service
      );*/
      obj['second'] = item.portPairList[i + 1];
      returnObject.push(obj);
    }

    return returnObject;
  }
  /** get country code from the the port data name - e.g KOREA,PUSAN(KRPUS)
   * KR - is the code
   */
  public getCountryCode(portName: string) {
    const names = portName.split('(');
    // lenght -1 so that only (XXXXX) bracket is considered.
    return this.getPortCode(portName).substring(0, 2);
  }
  public getPortCode(portName: string): string {
    const names = portName.split('(');
    // lenght -1 so that only (XXXXX) bracket is considered.
    return names[names.length - 1].substring(0, 5);
  }
  /** get the diff between 2 dates */
  public getDateDiff(dStart, dEnd): number {
    dStart = new Date(dStart);
    dEnd = new Date(dEnd);
    return Math.round((dEnd - dStart) / Utils.oneDay);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected
      ? // If all was selected before this click, it willbe unselcted now and hence clear selection
        this.selection.clear()
      : // if all wasnt selected before this click, it will be selected now. Select all
        this.items.forEach(row => this.selection.select(row));
    this.isAllSelected = !this.isAllSelected;
    if (this.isAllSelected) {
      this.totalSelected = this.selection.selected.length;
    } else {
      this.totalSelected = 0;
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }
  public ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
  /** Open the export pop up dialog */
  public openDialog() {
    this.openExportDialog.emit({
      selectedRecords: this.selection.selected,
      comp: 'result-component'
    });
  }
  /** THis method toggles between select/unselect checkbox of the item on whose the click event hs occured */
  public toggleItem(event, item) {
    this.selection.toggle(item);
    // update the lenght
    this.totalSelected = this.selection.selected.length;
    if (this.totalSelected === this.items.length) {
      this.isAllSelected = true;
    } else {
      this.isAllSelected = false;
    }
  }
  public setOpened(index) {
    if (this.currentlyOpenedPanel.indexOf(index) === -1) {
      this.currentlyOpenedPanel = [...this.currentlyOpenedPanel, index];
    }
  }
  public setClosed(index) {
    if (this.currentlyOpenedPanel.indexOf(index) !== -1) {
      this.currentlyOpenedPanel = this.currentlyOpenedPanel.filter(
        o => o !== index
      );
    }
  }
  public gotoTop() {
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }, 1);
  }

  public openFeedbackForm(): void {
    const currentlyLoggedInUserInfoKeyCloak =
      Utils.currentlyLoggedInUserInfoKeyCloak;
    if (currentlyLoggedInUserInfoKeyCloak) {
      const dialogRef: MatDialogRef<FeedbackComponent> = this.dialog.open(
        FeedbackComponent,
        {
          width: '616px',
          data: {
            username: currentlyLoggedInUserInfoKeyCloak.userClaims.name,
            emailId: currentlyLoggedInUserInfoKeyCloak.userClaims.email,
            type: AppConstants.FEEDBACK_RESULT_TYPE,
            searchData: this.searchData
          },
          scrollStrategy: new NoopScrollStrategy()
        }
      );
      dialogRef.afterClosed().subscribe(result => {});
    }
  }
  public checkCo2Data(ports): boolean {
    let isPartial = false;
    for (const port of ports) {
      if (port && port.first) {
        isPartial = port.first.medianCo2 * this._cargoWt === 0 ? true : false;
        if (isPartial) {
          return isPartial;
        }
      }
    }
    return isPartial;
  }
}
