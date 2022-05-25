import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-expand-setting-view',
  templateUrl: './expand-view.component.html',
  styleUrls: ['./expand-view.component.scss']
})
export class ExpandViewComponent implements OnInit {

  @Input()
  data;
  @Input()
  vesselIndex;
  @Input()
  portIndex;


  constructor() { }

  ngOnInit(): void {
    //console.log(screen.width);
  }


  public changeValue(category, color, data) {
    if (category === 'dry' && color === 'green') {
      data.thresholdList.dry_yellow.min = data.thresholdList.dry_green.max;
    } else if (category === 'dry' && color === 'yellow') {
      data.thresholdList.dry_red.min = data.thresholdList.dry_yellow.max;
    } else if (category === 'reefer' && color === 'green') {
      data.thresholdList.reefer_yellow.min = data.thresholdList.reefer_green.max;
    } else if (category === 'reefer' && color === 'yellow') {
      data.thresholdList.reefer_red.min = data.thresholdList.reefer_yellow.max;
    } else if (category === 'bb' && color === 'green') {
      data.thresholdList.bb_yellow.min = data.thresholdList.bb_green.max;
    } else if (category === 'bb' && color === 'yellow') {
      data.thresholdList.bb_red.min = data.thresholdList.bb_yellow.max;
    } else if (category === 'empty' && color === 'green') {
      data.thresholdList.empty_yellow.min = data.thresholdList.empty_green.max;
    } else if (category === 'empty' && color === 'yellow') {
      data.thresholdList.empty_red.min = data.thresholdList.empty_yellow.max;
    }
  }

}
