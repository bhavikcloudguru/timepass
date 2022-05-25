import {
  Component,
  OnInit,
  ElementRef,
  EventEmitter,
  AfterViewInit,
  Inject
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-export-to-pdf',
  templateUrl: './export-to-pdf.component.html',
  styleUrls: ['./export-to-pdf.component.scss']
})
export class ExportToPdfComponent implements OnInit, AfterViewInit {
  public dataToBeRendered = [];
  public today: Date;
  public qrCode: any;
  public agencyDetails: any;
  public simpleView;
  public originData;
  public selectedCountries;
  public expansionHeight = 0;
  public displayTables = [];
  public routeImage;
  public totalPages;
  public services;
  public hasFeederService;
  public trLength;
  public pageHeight;
  public customerView;
  constructor(
    private elemeref: ElementRef,
    private dialogRef: MatDialogRef<ExportToPdfComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  public innerHTML = new EventEmitter<any>();

  ngOnInit(): void {
    this.today = new Date();
    this.originData = { ...this.data.originData };
    this.customerView = this.data.customerView;
    const columnSize = this.data.pSize.column;
    this.pageHeight = this.data.pSize.height;
    this.selectedCountries = this.data.selectedCountries;
    this.expansionHeight = this.data.expansionHeight;
    this.services = this.data.services;
    this.hasFeederService = this.data.hasFeederService;
    this.routeImage = this.data.image;
    this.qrCode = this.data.qrCode;
    this.trLength = this.data.transshipmentLength;
    const totalDisplayColumns = [...this.originData.displayedColumns];

    const _count = this.data.canvasWidth / 155;
    const _ceil = Math.ceil(_count);

    const _firstTableColumn = columnSize - _ceil;
    const totalDisplayColumn = [...this.originData.displayedColumns];
    const remainingColumns = totalDisplayColumn.splice(_firstTableColumn);

    this.originData.displayedColumns = totalDisplayColumn;

    const splitColumns = remainingColumns.reduce(
      (acc, _, i) =>
        i % (columnSize - 1)
          ? acc
          : [...acc, remainingColumns.slice(i, i + (columnSize - 1))],
      []
    );

    for (let items of splitColumns) {
      items.unshift('portName');
      const data = {
        originData: { ...this.originData }
      };
      data.originData.displayedColumns = items;
      this.displayTables.push(data);
    }
    this.totalPages = this.displayTables.length + 1;
    let array = [];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const pages = [];
      const innertml = this.elemeref.nativeElement.innerHTML;
      const doc = new DOMParser().parseFromString(innertml, 'text/html');
      for (let i = 0; i < this.totalPages; i++) {
        const pag = doc.getElementById('page-' + (i + 1));
        pages.push(pag);
      }
      this.innerHTML.emit(pages);
    }, 1);
    // comment this below line to see the  pop up
    this.dialogRef.close();
  }

  public getRemTrnsHeight(_tItem) {
    const tLength = _tItem && _tItem.length ? _tItem.length : 0;
    const transshipmentCount =
      this.data.transshipmentLength && this.data.transshipmentLength.length
        ? this.data.transshipmentLength.length
        : 0;
    const remCount = transshipmentCount - tLength;
    const heightArr = Array(remCount)
      .fill(1)
      .map((x, i) => i + 1);
    return heightArr;
  }
}
