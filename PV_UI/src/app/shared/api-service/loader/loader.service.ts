import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoaderState, ILoaderService } from '../../interfaces/loader-interface';

@Injectable({
  providedIn: 'root'
})
export class LoaderService implements ILoaderService {
  private loaderSubject = new BehaviorSubject<LoaderState>(null);
  private updateSubject = new BehaviorSubject<LoaderState>(null);
  loaderObservable = this.loaderSubject.asObservable();
  constructor() {}

  /**
   * Show Loader component
   * @param {string} message - add message show in loader
   */
  public show(type?: string, message?: string) {
    this.loaderSubject.next(<LoaderState>{
      show: true,
      message: message,
      type: type
    });
  }

  /**
   * Update message in the loader component.
   * @param {string} message - updated message.
   */

  public update(message: string) {
    this.updateSubject.next(<LoaderState>{ message: message });
  }

  public getObservable(): Observable<any> {
    return this.loaderSubject.asObservable();
  }

  public getUpdateObservable(): Observable<any> {
    return this.updateSubject.asObservable();
  }

  /**
   * Hide Loader component
   */
  public hide() {
    this.loaderSubject.next(<LoaderState>{ show: false });
  }
}
