import {
  Component,
  OnInit,
  HostBinding,
  Input,
  Optional,
  Self,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  NgControl,
  FormBuilder,
  ControlValueAccessor
} from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSlider } from '@angular/material/slider';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: SliderComponent }]
})
export class SliderComponent
  implements
    OnInit,
    MatFormFieldControl<number>,
    ControlValueAccessor,
    OnDestroy {
  static nextId = 0;
  public _value = 0;
  private _oldValue = 0; // Keep track of the older value
  @Input() min: number;
  @Input() max: number;
  @Input() step: number;
  @ViewChild('sliderInternal', { read: MatSlider }) sliderInternal: MatSlider;
  /** MatFormFieldControl properties-Start */
  private subsripctionArray = [] as Subscription[];
  // This property allows someone to set or get the value of our control.
  get value(): number {
    if (this._value) {
      return this._value;
    }
    return 0;
  }
  set value(input: number) {
    /** If you you use the round func slider will start jumping whenver the round function
     * returns the next integer. for eg. Math.round(3.4)=3 and Math.round(3.5)=4;
     * This will make the slider jump. To avoid that, when the value is increasing,
     * use floor function and when the value is decreasing, use the ceiling function
     */
    // When the value is increasing, use floor function. It'll stablise the slider
    if (this._oldValue < input) {
      input = Math.floor(input);
    } else {
      // When the value is decreasing , use ceiling function, it'll stabilise the slider
      input = Math.ceil(input);
    }

    this.sliderForm.setValue({ inputControl: input });
    this._value = input;
    this._oldValue = input;
    this.onChange(input);
    this.stateChanges.next();
  }

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
  /**
   * This property indicates whether the form field control is empty
   */
  get empty() {
    // return !this.value;
    return false;
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
  /**
   * This property tells the form field when it should be in the disabled state.
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = coerceBooleanProperty(disabled);
    this._disabled ? this.sliderForm.disable() : this.sliderForm.enable();
    this.stateChanges.next();
  }
  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fb: FormBuilder,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>
  ) {
    this.subsripctionArray.push(
      fm.monitor(elRef.nativeElement, true).subscribe(origin => {
        this.focused = !!origin;
        if (this.focused) {
          //  this.sliderInternal.focus();
        }
        this.stateChanges.next();
      })
    );
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  public sliderForm = new FormGroup({
    inputControl: new FormControl(this._value)
  });

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
  @HostBinding() id = `cnco-slider-${SliderComponent.nextId++}`;
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
  private _required = false;
  private _disabled = false;
  errorState: boolean;
  /**
   * This property allows us to specify a unique string for the type of control in form field.
   */
  controlType?: string = 'cnco-slider';
  autofilled?: boolean;
  /**
   * This method is used by the <mat-form-field> to specify the IDs that
   * should be used for the aria-describedby attribute of your component
   */
  @HostBinding('attr.aria-describedby') describedBy = '';
  /** ControlValueAccessor properties - End */

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
    // TODO check here
    // if ((event.target as Element).tagName.toLowerCase() !== 'input') {
    // this.elRef.nativeElement.querySelector('input').focus();
    this.sliderInternal.focus();
    // }
  }

  /** MatFormFieldControl properties-End */

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.fm.stopMonitoring(this.elRef.nativeElement);
    this.stateChanges.complete();
    this.subsripctionArray.forEach(s => s.unsubscribe());
  }
  /** ControlValueAccessor properties- Start */
  /**
   *
   * @param obj is the method that writes a new value from the form model into the view or
   * (if needed) DOM property
   */
  writeValue(obj: any): void {
    this.value = obj;
    // this.onChange(obj);
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
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
  private onChange = a => {};

  @HostListener('keydown', ['$event'])
  private changeFocusOnEnter(event: any) {
    if (event.shiftKey && event.keyCode === 9) {
      console.log('shift+tab pressed.');
    }
  }
  /**
   * THis function is used to increment /decrement value of the slider on keyboard interaction.
   * Due to increase in steps for smoother animation, the keyboard interaction has become diff
   * @param event
   */
  @HostListener('keydown', ['$event'])
  public changeSLiderValue(event: any) {
    switch (event.keyCode) {
      // UP
      case 38:
      // Right
      case 39:
        this.value = this._value + 1;
        if (this._value > this.max) {
          this.value = this.max;
        }
        this.sliderInternal.focus();
        break;
      // left
      case 37:
      // Down
      case 40:
        this.value = this._value - 1;
        if (this._value < this.min) {
          this.value = this.min;
        }
        this.sliderInternal.focus();
        break;
    }
    //  console.log('wroking........', event);
  }
}
