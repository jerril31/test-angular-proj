import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private messageSource = new BehaviorSubject('default message');
  currentTitle = this.messageSource.asObservable();
  private usernameSource = new BehaviorSubject('User');
  userName = this.usernameSource.asObservable();

  constructor() {}

  changeTitle(message: string) {
    this.messageSource.next(message);
  }

  assignUserNameField(username: string){
    this.usernameSource.next(username);
  }
}
