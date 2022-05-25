import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  navLinks: any[];
  activeLinkIndex = -1;
  constructor(public router: Router) {
    this.navLinks = [
      {
        label: 'Dashboard',
        link: './capacity/dashboard',
        index: 0
      },
      {
        label: 'Capacity requests',
        link: './requests',
        index: 1
      },
      {
        label: 'Settings',
        link: './settings',
        index: 2
      },
      {
        label: 'Overview',
        link: './overview',
        index: 2
      }
    ];
  }

  ngOnInit(): void {
    this.router.events.subscribe(res => {
      //this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
  }
}
