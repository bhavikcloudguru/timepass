import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-table',
  templateUrl: './pdf-table.component.html',
  styleUrls: ['./pdf-table.component.scss']
})
export class PdfTableComponent implements OnInit {
  @Input() public selectedCountries: any;
  @Input() public originData: any;
  @Input() public expansionHeight: any;
  @Input() public transshipmentLength: any;
  @Input() public customerView;
  public simpleView;
  constructor() {}

  ngOnInit(): void {}

  public getRemTrnsHeight(_tItem) {
    const tLength = _tItem && _tItem.length ? _tItem.length : 0;
    const transshipmentCount =
      this.transshipmentLength && this.transshipmentLength.length
        ? this.transshipmentLength.length
        : 0;
    const remCount = transshipmentCount - tLength;
    const heightArr = Array(remCount)
      .fill(1)
      .map((x, i) => i + 1);
    return heightArr;
  }
}
