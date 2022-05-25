import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit, AfterViewChecked {
  @ViewChild('ghost')
  ghost: ElementRef;
  @ViewChild('minOut')
  minOut: ElementRef;
  @ViewChild('maxOut')
  maxOut: ElementRef;

  @Input()
  name: string;
  @Input()
  min = 0;
  @Input()
  max;
  @Input()
  minValue: number;
  @Input()
  maxValue: number;
  @Input()
  step = 1;
  @Input()
  public labelInfo: string = 'control';
  @Output()
  rangeChange: EventEmitter<{
    minValue: number;
    maxValue: number;
  }> = new EventEmitter();

  submit() {
    this.rangeChange.emit({
      minValue: this.minValue,
      maxValue: this.maxValue
    });
  }

  setLow() {
    if (this.ghost && this.minOut) {
      const width = this.ghost.nativeElement.getBoundingClientRect().width;
      const val = (this.minValue - this.min) / (this.max - this.min);
      this.ghost.nativeElement.style.setProperty('--low', 100 * val + 1 + '%');
      this.minOut.nativeElement.style.setProperty(
        '--pos',
        Math.floor(width * val) - Math.floor(20 * val) - 3 + 'px'
      );
    }
  }

  setHigh() {
    if (this.ghost) {
      const width = this.ghost.nativeElement.getBoundingClientRect().width;
      const val = (this.maxValue - this.min) / (this.max - this.min);

      this.ghost.nativeElement.style.setProperty('--high', 100 * val - 1 + '%');
      this.maxOut.nativeElement.style.setProperty(
        '--pos',
        Math.floor(width * val) - Math.floor(10 * val) - 2 + 'px'
      );
    }
  }

  ngOnInit(): void {
    this.minValue = this.minValue || this.min;
    this.maxValue = this.maxValue || this.max;
  }

  ngAfterViewChecked(): void {
    this.setLow();
    this.setHigh();
  }
}
