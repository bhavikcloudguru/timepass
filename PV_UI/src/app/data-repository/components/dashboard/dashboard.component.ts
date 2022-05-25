import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CCMDataService } from 'src/app/ccm.data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public lastUpdatedForDeadlines = '';
  public lastUpdatedProductPricing = '';
  constructor(private router: Router, private cCMDataService: CCMDataService) {}

  ngOnInit(): void {
    this.cCMDataService.getLastUpdatedForDeadlines().subscribe(x => {
      console.log(x);
      this.lastUpdatedForDeadlines = x.lastUpdated;
      this.lastUpdatedProductPricing = x.lastUpdatedProductPricing;
    });
  }
  public navigate(url: string[]) {
    this.router.navigate(url);
  }
}
