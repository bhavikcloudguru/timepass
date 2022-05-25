import {
  Component,
  OnInit,
  HostListener,
  Input,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-traffic-status',
  templateUrl: './traffic-status.component.html',
  styleUrls: ['./traffic-status.component.scss']
})
export class TrafficStatusComponent implements OnInit {
  public hover = false;
  @Input()
  public status;
  @Input()
  public itemIndex;

  public gBorder = false;
  public oBorder = false;
  public rBorder = false;
  @Output()
  selectItem = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  public selectStatus(status: string) {
    this.selectItem.emit(status);
  }
}
