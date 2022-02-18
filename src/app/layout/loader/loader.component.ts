import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderState } from './loader';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements AfterViewInit, OnDestroy  {
  show = false;
  private subscription: Subscription = new Subscription;

  constructor(private loaderService: LoaderService) { }

  ngAfterViewInit() {
    this.subscription = this.loaderService.loaderState
        .subscribe((state: LoaderState) => {
          if (state.show) {
            this.show = state.show;
          } else {
            this.show = false;
          }
        });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}