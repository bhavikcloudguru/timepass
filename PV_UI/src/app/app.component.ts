import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isOpen = false;
  public count = 0;

  public openRightPanel(event): void {
    this.count = event;
    this.isOpen = !this.isOpen;
  }

  public closeRightPanel(event): void {
    this.isOpen = false;
  }
}
