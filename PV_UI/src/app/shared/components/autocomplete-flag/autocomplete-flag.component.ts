import {
  Component,
  OnInit,
  OnDestroy,
  HostBinding,
  Input,
  Optional,
  Self,
  ElementRef,
  AfterViewInit,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Observable, Subscription } from 'rxjs';
import {
  NgControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { OriginDestination } from '../../models/OriginDestinationDTO';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  startWith,
  distinctUntilChanged,
  filter,
  map,
  debounceTime
} from 'rxjs/operators';
import {
  MatAutocompleteTrigger,
  MatAutocompleteOrigin
} from '@angular/material/autocomplete';

@Component({
  selector: 'app-autocomplete-flag',
  templateUrl: './autocomplete-flag.component.html',
  styleUrls: ['./autocomplete-flag.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: AutocompleteFlagComponent }
  ]
})
export class AutocompleteFlagComponent
  implements
    OnInit,
    OnDestroy,
    AfterViewInit,
    MatFormFieldControl<OriginDestination | string>,
    ControlValueAccessor {
  // Used for givin IDs
  public randomName = '';
  static nextId = 0;
  @Input() reference: MatAutocompleteOrigin;
  @Input() autoFocus: boolean = false;
  @Output() blurr = new EventEmitter();
  // this is used to deactivate the autoselected option incase you dont tab out but click and then tab out
  @ViewChild('matTrigger', { read: MatAutocompleteTrigger })
  matTrigger: MatAutocompleteTrigger;
  public filteredOptions$: Observable<OriginDestination[]>;
  // All the subscriptions we use in this code are pushed to this array and unsubscribed at the end
  private subscriptionArray = [] as Subscription[];
  /** Code for auto complete */
  // This will hold all the data for matAutoComplete
  private _portList = [];
  @Input() set portList(a: any[]) {
    if (a && a.length > 0) {
      this._portList = a;
      this.filteredOptions$ = this.getFilteredOptions();
    }
  }
  get portList(): any[] {
    return this._portList;
  }
  // used as a key to highlight the text from mat auto complete
  public toHighlight = '';
  // private _value: OriginDestination | string = '';

  // The form group used in the template
  public autocompleteFlagForm = new FormGroup({
    autocompleteInput: new FormControl('', Validators.required)
  });
  /** MatFormFieldControl properties-Start */
  // value: string | OriginDestination;

  private _value: string | OriginDestination = '';
  // This property allows someone to set or get the value of our control.
  get value(): string | OriginDestination {
    /*if (
      this.autocompleteFlagForm.value &&
      this.autocompleteFlagForm.value.autocompleteInput
    ) {
      return this.autocompleteFlagForm.value.autocompleteInput;
    }*/
    return this._value;
  }
  set value(input: string | OriginDestination) {
    this._value = input;
    this.autocompleteFlagForm.setValue({ autocompleteInput: input });
    this.onChange(input);
    this.stateChanges.next();
  }

  /**
   * Because the <mat-form-field> uses the OnPush change detection strategy,
   * we need to let it know when something happens in the form field control
   * that may require the form field to run change detection.
   * We do this via the stateChanges property. So far the only thing the form
   * field needs to know about is when the value changes. We'll need to emit on the
   * stateChanges stream when that happens, and as we continue flushing out these
   * properties we'll likely find more places we need to emit.
   * We should also make sure to complete stateChanges when our component is destroyed.
   */
  stateChanges /*: Observable<void>*/ = new Subject<void>();
  /**
   * This property should return the ID of an element in the component's template that we want the
   * <mat-form-field> to associate all of its labels and hints with.
   * In this case, we'll use the host element and just generate a unique ID for it.
   */
  @HostBinding() id = `autocomplete-flag-${AutocompleteFlagComponent.nextId++}`;

  /**This property allows us to tell the <mat-form-field> what to use as a placeholder.
   *
   */
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh: string) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  // ngControl: NgControl;
  /**
   * This property indicates whether or not the form field control should be considered to be in
   * a focused state. When it is in a focused state, the form field is displayed with a solid color
   * underline. For the purposes of our component, we want to consider it focused if any of the part
   * inputs are focused. We can use the FocusMonitor from @angular/cdk to easily check this.
   * We also need to remember to emit on the stateChanges stream so change detection can happen.
   */
  focused = false;
  /**
   * This property indicates whether the form field control is empty
   */
  get empty() {
    return !this.value;
  }
  /**
   * This property is used to indicate whether the label should be in the floating position.
   * We'll use the same logic as matInput and float the placeholder when the input is focused
   * or non-empty
   */
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }
  /**
   * This property is used to indicate whether the input is required.
   * <mat-form-field> uses this information to add a required indicator to the placeholder.
   * Again, we'll want to make sure we run change detection if the required state changes.
   */
  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;
  /**
   * This property tells the form field when it should be in the disabled state.
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled
      ? this.autocompleteFlagForm.disable()
      : this.autocompleteFlagForm.enable();
    this.stateChanges.next();
  }
  private _disabled = false;
  private _errorState = false;

  get errorState(): boolean {
    /**
     * The form is in error state on when it is not pristine AND
     * either - it is required and value is absent
     * or - some error is present on the input control.
     */
    const ctrl = this.autocompleteFlagForm.controls.autocompleteInput;

    if (
      this._errorState ||
      (!ctrl.pristine &&
        ((this.required &&
          !this.autocompleteFlagForm.value['autocompleteInput']) ||
          this.autocompleteFlagForm.controls.autocompleteInput.errors))
    ) {
      return true;
    } else {
      return false;
    }
  }
  set errorState(v) {
    this._errorState = v;
  }
  /**
   * This property allows us to specify a unique string for the type of control in form field.
   */
  controlType? = 'autocomplete-flag';
  autofilled?: boolean;
  /**
   * This method is used by the <mat-form-field> to specify the IDs that
   * should be used for the aria-describedby attribute of your component
   */
  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }
  /**
   *
   * @param event This method will be called when the form field is clicked on.
   * It allows your component to hook in and handle that click however it wants.
   * The method has one parameter, the MouseEvent for the click
   */
  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
      setTimeout(() => {
        this.matTrigger.openPanel();
      }, 2);
    }
  }

  /** MatFormFieldControl properties-End */

  // ngOnInit(): void {}
  ngOnDestroy(): void {
    this.fm.stopMonitoring(this.elRef.nativeElement);
    this.stateChanges.complete();

    this.subscriptionArray.forEach(s => s.unsubscribe());
  }
  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fb: FormBuilder,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>
  ) {
    this.subscriptionArray.push(
      fm.monitor(elRef.nativeElement, true).subscribe(origin => {
        this.focused = !!origin;

        this.stateChanges.next();
      })
    );
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
    this.randomName = Math.random().toString(36).slice(2);
  }
  ngAfterViewInit(): void {
    if (this.autoFocus) {
      setTimeout(() => {
        this.elRef.nativeElement.querySelector('input').focus();
        this.matTrigger.openPanel();
      }, 100);
    }
  }
  /** ControlValueAccessor properties- Start */
  /**
   *
   * @param obj is the method that writes a new value from the form model into the view or
   * (if needed) DOM property
   */
  writeValue(input: any): void {
    this._value = input;
    this.autocompleteFlagForm.setValue({ autocompleteInput: input });
    // this.onChange(obj);
    this.stateChanges.next();
  }
  /**
   *
   * @param fn is a method that registers a handler that should be called when something in the
   * view has changed. It gets a function that tells other form directives and form controls to
   *  update their values
   */
  registerOnChange(fn: (a) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {}
  /** ControlValueAccessor properties - End */

  ngOnInit() {
    this.filteredOptions$ = this.getFilteredOptions();
    this.subscriptionArray.push(
      this.autocompleteFlagForm.controls.autocompleteInput.valueChanges.subscribe(
        s => {
          this.onChange(s);
          this.stateChanges.next();
        }
      )
    );
  }
  displayWith(item): string {
    if (!item || (item && !item.portCode)) {
      return item;
    }

    return item.portCode + '   ' + item.portName + ', ' + item.countryName;
  }
  private filter(value): OriginDestination[] {
    if (value !== null) {
      const v = value.toLowerCase();
      return this.portList.filter(
        obj =>
          obj.portName.toLowerCase().indexOf(v) === 0 ||
          obj.portCode.toLowerCase().indexOf(v) === 0 ||
          obj.countryName.toLowerCase().indexOf(v) === 0
      );
    } else {
      return [];
    }
  }
  private distinctUntilChangedComparator = (oldValue, newValue) => {
    if (oldValue && !oldValue.portCode && newValue && !newValue.portCode) {
      return oldValue.trim().toLowerCase() === newValue.trim().toLowerCase();
      // return true;
    }
    if (oldValue && !newValue) {
      //  this.showSearch = false;
    }
    return false;
  };
  updateMySelection(input) {
    // this.autocompleteFlagForm.controls['autocompleteInput'].setValue(input);
    if (this.matTrigger.activeOption) {
      this.matTrigger.autocomplete._keyManager.setActiveItem(null);
    }
    // this.onChange({ autocompleteInput: input });
    // this.stateChanges.next();
  }
  onChange: any = (a: any) => {};
  onTouched: any = (a: any) => {};
  private getFilteredOptions(): Observable<OriginDestination[]> {
    return this.autocompleteFlagForm.controls.autocompleteInput.valueChanges.pipe(
      startWith(''),
      // distinctUntilChanged((x, y) => this.distinctUntilChangedComparator(x, y)),

      map(value => {
        if (value && value.portCode) {
          this.toHighlight = value.portCode;
          return this.filter(value.portCode.trim());
        } else {
          this.toHighlight = value;
          return this.filter(value.trim());
        }
      })
    );
  }
}
