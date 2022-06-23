import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AppConstant } from '../constant/app.constant';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class AuthguardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean
  {
    if(route.url.toString() === AppConstant.URL_CALLBACK && !localStorage.getItem('userProfile')){
      //First time entry to app, return true to allow auth login  
      return true;
    }else{
      if (this.authService.validateUserGroup()) {
        return true;
      } else {
        this.router.navigate([AppConstant.URL_UNAUTHORIZED]);
        return false;
      }
    }
    

  }

}
