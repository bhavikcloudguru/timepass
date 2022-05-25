import {
  Component,
  OnInit,
  ElementRef,
  EventEmitter,
  AfterViewInit,
  Inject
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

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
  constructor(
    private elemeref: ElementRef,
    private dialogRef: MatDialogRef<ExportToPdfComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private domSanitizer: DomSanitizer
  ) {}
  public innerHTML = new EventEmitter<string[]>();
  public readonly liHeight = 72;
  private longestRoute = -1;
  private readonly maxHeight = 465;
  ngOnInit(): void {
    this.longestRoute = -1;
    this.today = new Date();
    this.qrCode = this.data.qrCode;
    console.log(this.qrCode);
    console.log(this.domSanitizer.bypassSecurityTrustUrl(this.qrCode));
    this.agencyDetails = this.data.agencyDetails;
    this.agencyDetails.originCountry = this.data.originCountry;
    this.agencyDetails.destinationCountry = this.data.destinationCountry;
    // let count = 0;
    let array = [];
    this.data.selectedRecords.forEach((v, i) => {
      if (v.pointToPointTransit > this.longestRoute) {
        // find the longest route for dynamic height calculation
        this.longestRoute = v.pointToPointTransit;
      }
      array.push(v);
      if (i % 4 === 3) {
        this.dataToBeRendered.push(array);
        array = [];
      }
    });
    if (array.length !== 0) {
      this.dataToBeRendered.push(array);
    }
    this.generateDynamicHeight();
    // console.log('rendering........', this.dataToBeRendered);
  }
  /** THis code generates dynamic height for each route to be displayed */
  private generateDynamicHeight() {
    const heightMap = {};
    this.dataToBeRendered.forEach(dataToBeRendered => {
      dataToBeRendered.forEach(data => {
        // if 4 transhipments , then give max height
        
        if (data.route?.length === 6) {
          data.height = this.maxHeight;
        } else {
          // let us calculate the percentage of the route lenght to the max
          let percent = (data.pointToPointTransit * 100) / this.longestRoute;
          /** We will keep our percentages to multiples of 5 */
          percent = Math.round(percent / 5) * 5;
          data.height = ((this.maxHeight * percent) / 100) + 195;
        }
        if(data.height > 500) {
          data.height = data.height - 175;
        }
        /** Assign item height */
        data.liHeight = data.height / data.route.length;
        /** If min item height is more than item heigt, assign min item height */
        data.liHeight =
          data.liHeight > this.liHeight ? data.liHeight : this.liHeight;
        /** If the totol height is less than sum of all the heights of its children, assign the product as height */
        data.height =
          data.height >= data.liHeight * data.route.length
            ? data.height
            : data.liHeight * data.route.length;
        /** Maintin a map of number of days and height. The height corresponding to a number should be max
         * amongst routes with same number of days.
         */
        if (
          !heightMap[data.pointToPointTransit] ||
          heightMap[data.pointToPointTransit] < data.height
        ) {
          heightMap[data.pointToPointTransit] = data.height;
        }
      });
    });
    // console.log('heightMap', heightMap);

    let lastHeight = 0;
    /** Make sure that routes with lesser time dont have longer length due to height adjustments. */
    Object.keys(heightMap).forEach(key => {
      if (heightMap[key] <= lastHeight) {
        lastHeight =
          lastHeight + this.getHeight(1, lastHeight) > this.maxHeight
            ? this.maxHeight
            : lastHeight + this.getHeight(1, lastHeight);
        heightMap[key] = lastHeight;
      } else {
        lastHeight = heightMap[key];
      }
    });
    console.log(
      'height map, key is the route length and value is the height',
      heightMap
    );
    /** Assign height corresponding to each number of days. This will equilise all routes with same
     * number of days to same height
     */
    this.dataToBeRendered.forEach(dataToBeRendered => {
      dataToBeRendered.forEach(data => {
        data.height = heightMap[data.pointToPointTransit];
        data.liHeight = data.height / data.route.length;
      });
    });
  }
  /**Take height and return input percent of the height
   * e.g height is 100px, and step is 2, we will return 2 px;
   */
  private getHeight(step, height) {
    const onePercent = height / 100;
    /** We will keep our percentages to multiples of 5 */
    const returnValue = Math.round(onePercent * step);
    /** Incase return value is 0, return 2 */
    return returnValue > 5 ? returnValue : 5;
  }
  ngAfterViewInit() {
    // console.log('inside popuppppppp', this.elemeref.nativeElement.innerHTML);
    setTimeout(() => {
      const pages = [];
      const innertml = this.elemeref.nativeElement.innerHTML;
      const doc = new DOMParser().parseFromString(innertml, 'text/html');
      for (let i = 0; i < this.dataToBeRendered.length; i++) {
        const pag = doc.getElementById('page-' + i);
        pages.push(pag);
      }
      this.innerHTML.emit(pages);
    }, 1);
    // comment this below line to see the  pop up
    this.dialogRef.close();
  }
  getPairWiseData(item) {
    const returnObject = [];
    for (let i = 0; i < item.portPairList.length; ) {
      const obj = {};
      if (i === 0) {
        obj['first'] = item.portPairList[i];
        obj['second'] = item.portPairList[i+1];
        i++;
      } else if (i === item.portPairList.length) {
        obj['first'] = item.portPairList[i];
        i++;
      } else {
        obj['first'] = item.portPairList[i];
        obj['second'] = item.portPairList[i + 1];
        i = i + 2;
      }
      // obj['second'] = item.portPairList[i + 1];

      returnObject.push(obj);
    }
    // console.log('return obje', returnObject);
    return returnObject;
  }
}
