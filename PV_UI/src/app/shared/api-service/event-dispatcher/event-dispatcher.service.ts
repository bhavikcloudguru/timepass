import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class EventDispatcherService {
  // private static _emitters: { [ID: string]: EventEmitter<any> } = {};
  private static _subjects: { [ID: string]: Subject<any> } = {};

  public static readonly ON_GET_USER_DETALS: string = 'on_get_user_details';

  /**
   * Returns instance for specific event name
   * One instance each for each event name
   */
  /*  static get(ID: string): EventEmitter<any> {
    if (!this._emitters[ID]) {
      this._emitters[ID] = new EventEmitter();
    }
    return this._emitters[ID];
  }*/
  /**
   * Returns instance for specific Subject name
   * One instance each for each Subject
   */
  static next(ID: string, value?: any): void {
    if (!this._subjects[ID]) {
      this._subjects[ID] = new BehaviorSubject(false);
    }
    if (value) {
      this._subjects[ID].next(value);
    } else {
      this._subjects[ID].next();
    }
    //return this._emitters[ID];
  }

  static getObservable(ID: string): Observable<any> {
    if (!this._subjects[ID]) {
      this._subjects[ID] = new BehaviorSubject(false);
    }

    return this._subjects[ID].asObservable();
  }
  constructor() {}
}
