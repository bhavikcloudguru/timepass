import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import * as constants from './../../product-manager-constants';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-sort-by',
  templateUrl: './sort-by.component.html',
  styleUrls: ['./sort-by.component.scss']
})
/** This is the sort by filter component. This is a dumb component.
 * It does nothing except taking the data and showing it on the screen and bubbling even back
 * to the parent when user clicks on something.
 */
export class SortByComponent implements OnInit {
  constructor() {}

  public constants = constants;
  private _currenrtlySelectedFilter;
  //  @Input() formCtrl: FormControl;
  @Input() sortByFilterList: { view: string; value: string }[];

  @Input() set currenrtlySelectedFilter(v: { value: string; order: number }) {
    this._currenrtlySelectedFilter = v;
    //  this.formCtrl && this.formCtrl.setValue(v.value);
  }
  get currenrtlySelectedFilter(): { value: string; order: number } {
    return this._currenrtlySelectedFilter;
  }
  private _initialFilterValue: { value: string; order: number };
  @Input() set initialFilterValue(v: { value: string; order: number }) {
    this._initialFilterValue = v;
    // this.initialiseFilter();
  }
  get initialFilterValue() {
    return this._initialFilterValue;
  }

  public upArrowClass: string[] = [];
  public upArrowSrc: string[] = [];
  public downArrowClass: string[] = [];
  public downArrowSrc: string[] = [];
  @Output() mouse = new EventEmitter();
  @Output() arrow = new EventEmitter();

  @ViewChild('sortFilter', { read: MatSelect }) sortFilter: MatSelect;

  ngOnInit(): void {}
  ngAfterViewInit() {
    this.initialiseFilter();
  }
  /** this method is used to get the VIEW value of the selected filter. */
  public getViewValue(value: string): string {
    if (!value) {
      return;
    }
    return this.sortByFilterList.find(s => s.value === value).view;
  }

  /** used to emit data when the mouse hovers over the arrows or the option name */
  public mouseEvent($event, eventType: any, arrowType: string, i, value) {
    if (
      this.currenrtlySelectedFilter.value === value &&
      ((arrowType === 'up' && this.currenrtlySelectedFilter.order === 1) ||
        (arrowType === 'down' && this.currenrtlySelectedFilter.order === -1))
    ) {
      $event.stopPropagation();
      return;
    }
    if (arrowType === 'up' && eventType === 'mouseover') {
      this.upArrowSrc[i] = constants.DARK_GRAY_UP;
      this.upArrowClass[i] = 'Gray';
      $event.stopPropagation();
    } else if (arrowType === 'up' && eventType === 'mouseout') {
      this.upArrowSrc[i] = constants.GRAY_UP;
      this.upArrowClass[i] = 'Gray opac';
    }
    if (arrowType === 'down' && eventType === 'mouseover') {
      this.downArrowSrc[i] = constants.DARK_GRAY_DOWN;
      this.downArrowClass[i] = 'Gray';
      $event.stopPropagation();
    } else if (arrowType === 'down' && eventType === 'mouseout') {
      this.downArrowSrc[i] = constants.GRAY_DOWN;
      this.downArrowClass[i] = 'Gray opac';
    }
    this.upArrowSrc = [...this.upArrowSrc];
    this.upArrowClass = [...this.upArrowClass];
    this.downArrowSrc = [...this.downArrowSrc];
    this.downArrowClass = [...this.downArrowClass];
    this.mouse.emit({
      event: $event,
      type: eventType,
      direction: arrowType,
      index: i,
      value
    });
  }
  /** used to emit data on arrow click on arrows or option name */
  /**
   * This functions calls the sorting function based on Up/Down arrow selection.
   */
  public arrowClicked(event, value, type: string, index) {
    this.sortFilter.close();
    /** We stop event propagation as arrows are child of mat select options.
     * If we dont stop propagation, even the option click event will be fired.s
     */
    event.stopPropagation();
    this.upArrowSrc.forEach((v, i) => {
      if (i === index && type === 'up') {
        // This is so that one change detection cycle passes by
        setTimeout(() => {
          this.upArrowSrc[i] = constants.BLUE_UP;
          this.upArrowClass[i] = 'Blue';
        }, 10);
      } else {
        this.upArrowSrc[i] = constants.GRAY_UP;
        this.upArrowClass[i] = 'Gray opac';
      }
    });

    this.upArrowSrc = [...this.upArrowSrc];
    this.upArrowClass = [...this.upArrowClass];

    this.downArrowSrc.forEach((v, i) => {
      if (i === index && type === 'down') {
        // This is so that one change detection cycle passes by
        setTimeout(() => {
          this.downArrowSrc[i] = constants.BLUE_DOWN;
          this.downArrowClass[i] = 'Blue';
        }, 10);
      } else {
        this.downArrowSrc[i] = constants.GRAY_DOWN;
        this.downArrowClass[i] = 'Gray opac';
      }
    });

    this.downArrowSrc = [...this.downArrowSrc];
    this.downArrowClass = [...this.downArrowClass];

    this.arrow.emit({
      event,
      value,
      direction: type,
      index
    });
  }
  private initialiseFilter() {
    this.sortByFilterList.forEach((j, i) => {
      if (j.value === this.currenrtlySelectedFilter.value) {
        if (this.currenrtlySelectedFilter.order === 1) {
          this.upArrowSrc[i] = constants.BLUE_UP;
          this.upArrowClass[i] = 'Blue';
          this.downArrowSrc[i] = constants.GRAY_DOWN;
          this.downArrowClass[i] = 'Gray opac';
        } else {
          this.upArrowSrc[i] = constants.GRAY_UP;
          this.upArrowClass[i] = 'Gray opac';
          this.downArrowSrc[i] = constants.BLUE_DOWN;
          this.downArrowClass[i] = 'Blue';
        }
      } else {
        this.upArrowSrc[i] = constants.GRAY_UP;
        this.downArrowSrc[i] = constants.GRAY_DOWN;
        this.upArrowClass[i] = 'Gray opac';
        this.downArrowClass[i] = 'Gray opac';
      }
    });
  }
}
