import { Component, OnInit } from '@angular/core';
import { Utils } from 'src/app/common/utilities/Utils';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public serviceCodeMap = Utils.getServiceDetails();
  constructor() {}

  ngOnInit(): void {}
}
