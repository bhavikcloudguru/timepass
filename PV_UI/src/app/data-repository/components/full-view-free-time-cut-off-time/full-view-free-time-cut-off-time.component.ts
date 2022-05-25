import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DataService } from 'src/app/data.service';
import { DatePipe } from '@angular/common';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-full-view-free-time-cut-off-time',
  templateUrl: './full-view-free-time-cut-off-time.component.html',
  styleUrls: ['./full-view-free-time-cut-off-time.component.scss']
})
export class FullViewFreeTimeCutOffTimeComponent implements OnInit {
  constructor(
    private router: Router,
    private dataService: DataService,
    private dateAdapter: DateAdapter<Date>
  ) {}

  public dataToBeRendered: { data: any[] } = { data: [] };
  public showLoader = false;
  dataSource = new MatTableDataSource(this.dataToBeRendered.data);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  columnsToDisplay = [
    'serviceName',
    'vesselName',
    'vesselCode',
    'voyage',
    'bound',
    'portCode',
    'arrivalDate',
    'departureDate',
    'receivals',
    'cutoff',
    'remarks'
  ];
  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.showLoader = true;
    this.dataService.getFullViewFreeTimeCutOffTime().subscribe(s => {
      this.showLoader = false;
      this.dataSource.data = s.data;
    });
  }
  navigateBack(url: string) {
    this.router.navigate([url]);
  }
  transformDate(date) {
    try {
      const dates = date.split(' ');
      const mmddyyy = dates[0].split('-');
      const hhmm = dates[1].split(':');

      return this.dateAdapter.format(
        new Date(mmddyyy[2], mmddyyy[1] - 1, mmddyyy[0], ...hhmm),
        'full-view'
      );
    } catch (e) {
      console.log('error while parsing date', e);
      return '-';
    }
  }
}
