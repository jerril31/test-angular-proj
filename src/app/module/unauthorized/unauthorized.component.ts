import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConstant } from 'src/app/constant/app.constant';
import { HeaderService } from 'src/app/layout/header/header/header.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  constructor(private router: Router,
    private headerService: HeaderService) { }

  ngOnInit(): void {
    this.headerService.changeTitle(AppConstant.UNAUTHORIZED_SCREEN);
  }

}
