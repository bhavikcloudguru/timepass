import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public selectedSort;

  constructor() {}

  public setSortElement(item: any): void {
    this.selectedSort = item;
  }

  public getSortElement(): any {
    return this.selectedSort;
  }
}
