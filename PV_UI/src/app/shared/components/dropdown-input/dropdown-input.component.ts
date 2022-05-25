import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  Validators
} from '@angular/forms';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl
} from '@angular/material/form-field';
import { Observable, Subject } from 'rxjs';

export class InputData {
  constructor(public type: string, public ivalue: string) {}
}

/** Custom `MatFormFieldControl` for Dropdown number input. */
@Component({
  selector: 'app-dropdown-input',
  templateUrl: './dropdown-input.component.html',
  styleUrls: ['./dropdown-input.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: DropdownInputComponent }
  ]
})
export class DropdownInputComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<InputData>,
    OnInit,
    OnDestroy {
  static nextId = 0;
  @ViewChild('type') typeInput: HTMLInputElement;
  @ViewChild('ivalue') ivalueInput: HTMLInputElement;
  public displayPlaceholder = true;

  @Output() selectdropdownvalue = new EventEmitter<any>();
  public _types;
  @Input()
  @Input()
  get types() {
    return this._types;
  }
  set types(list) {
    if (list) {
      this._types = list;
      this.selectedType = list[0];
    }
  }

  @Input() placeHolder: any;

  parts: FormGroup;
  stateChanges = new Subject<void>();
  focused = false;
  controlType = 'dropdown-input';
  public hiddenView = true;
  public selectedType;

  id = `dropdown-input-${DropdownInputComponent.nextId++}`;
  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    const {
      value: { type, ivalue }
    } = this.parts;

    return !type && !ivalue;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): InputData | null {
    if (this.parts.valid) {
      const {
        value: { type, ivalue }
      } = this.parts;
      return new InputData(type, ivalue);
    }
    return null;
  }
  set value(fdata: InputData | null) {
    const { type, ivalue } = fdata || new InputData('', '');
    this.parts.setValue({ type, ivalue });
    this.stateChanges.next();
  }

  @Input() qid;
  @Input() qvalue;

  get errorState(): boolean {
    return this.parts.invalid && this.parts.dirty;
  }

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    this.parts = formBuilder.group({
      type: [null],
      ivalue: [null]
    });

    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (this.qid) {
      this.selectedType = this.types.find(e => e.quantityId === this.qid);
      this.parts.controls.type.setValue(this.selectedType);
      this.parts.controls.ivalue.setValue(this.qvalue);
    }
  }

  autoFocusNext(
    control: AbstractControl,
    nextElement?: HTMLInputElement
  ): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  public valueChange() {
    this.selectdropdownvalue.emit(this.parts.value);
  }

  setDescribedByIds(ids: string[]) {
    /*  const controlElement = this._elementRef.nativeElement
      .querySelector('.txt-input')!;
    controlElement.setAttribute('aria-describedby', ids.join(' ')); */
  }

  onContainerClick() {}

  writeValue(tel: InputData | null): void {
    this.value = tel;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  displayWith(item): string {
    if (!item || (item && !item.countryCode)) {
      return item;
    }
    const s = (item?.countryName).toLowerCase();
    const displayLbl = s
      .split(' ')
      .map(x => x[0].toUpperCase() + x.slice(1))
      .join(' ');
    const displayLabel = displayLbl + '(+' + item.isdCode + ')';
    return displayLabel;
  }

  public onMouseOut(event) {
    this.hiddenView = !this.hiddenView;
    event.stopPropagation();
  }

  public selectItem(item) {
    this.selectedType = item;
    this.types.sort((x, y) => {
      return x.label == item.label ? -1 : y.label == item.label ? 1 : 0;
    });
    this.parts.controls.type.setValue(item);
    this.hiddenView = !this.hiddenView;
    this.valueChange();
  }

  public focusChange() {
    const value = this.parts.get('ivalue').value;
    this.displayPlaceholder = false;
    this._focusMonitor.focusVia(this.ivalueInput, 'program');
    console.log('focus change');
  }
  public onFocusOutEvent(event) {
    const value = this.parts.get('ivalue').value;
    if (!value) {
      this.displayPlaceholder = true;
    }
  }
  public onFocusInEvent(event) {
    this.displayPlaceholder = false;
  }

  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;
}
