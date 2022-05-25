import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public result = [];
  constructor() { }

  ngOnInit(): void {
  }

  public getResult(event) {
   this.result = event?.capacitySearch?.vvls ? event?.capacitySearch?.vvls : [];
  }

}
