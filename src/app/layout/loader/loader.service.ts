import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderState } from './loader';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loaderSubject = new Subject<LoaderState>();
  loaderState = this.loaderSubject.asObservable();
  constructor() {}
  /**
   * Show loader
   * Send show property value as true
   */
  show() {
    this.loaderSubject.next(<LoaderState>{show: true});
  }

  /**
   * Hide loader
   * Send show property value as false
   */
  hide() {
    this.loaderSubject.next(<LoaderState>{show: false});
  }

  /**
   * Show Loader with timeout
   */
  showTimedLoader() {
    setTimeout(() => {
      this.hide();
    }, 3000);
   this.show();
  }
}
