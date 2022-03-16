import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private messageSource = new BehaviorSubject('default message');
  currentTitle = this.messageSource.asObservable();

  constructor() {}

  changeTitle(message: string) {
    this.messageSource.next(message);
  }
}
