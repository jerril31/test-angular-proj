import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConstant } from 'src/app/constant/app.constant';
import { environment } from 'src/environments/environment';
import { HeaderService } from './header.service';

@Component({
  selector: 'pprmr-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  pathDeltaWhiteLogo: string;
  title: string = '';
  applicationName: string;
  userName: string = '';
  appDeploymentLevel: string;
  localTime: Date = new Date();
  utcTime: Date = new Date();
  //userInfo: Object;
  currentDate = new Date();
  clockInterval = 1000;
  constructor(
    private route: ActivatedRoute,
    private headerService: HeaderService
  ) {
    this.pathDeltaWhiteLogo = 'assets/images/delta-logo_white.png';
    this.applicationName = AppConstant.APP_NAME_PPRMR;
    this.setUserName();
    this.appDeploymentLevel = environment.appDeploymentLevel;
  }

  setUserName() {
    this.userName = 'User';
  }

  ngOnInit(): void {
    this.subscription = this.headerService.currentTitle.subscribe(
      (title) => (this.title = title)
    );
    // Set clock time in particular interval
    setInterval(() => {
      this.setClock();
    }, this.clockInterval);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * This method set current and UTC time
   */
  setClock() {
    const curDate = new Date();
    this.localTime = curDate;
    this.utcTime = this.millisToUTCDate();
  }

  /**
   * This method is used to convert current date to UTT date
   */
  millisToUTCDate() {
    const date = new Date();
    const _utc = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
    return _utc;
  }
}
