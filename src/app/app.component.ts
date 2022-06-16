import { Component } from '@angular/core';
import { authCodeFlowConfig } from './auth-code-flow.config';
import { filter } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { HeaderService } from './layout/header/header/header.service';
import {
  UserProfile
} from './model/pdf-pw-remover-file';
import { environment } from 'src/environments/environment';
import { LoaderService } from './layout/loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'pdf-pw-remover';

  access_token: any = '';

  constructor(private oauthService: OAuthService, private headerService: HeaderService, private _loaderSvc: LoaderService) {
    this._loaderSvc.show();
    // if(environment.appDeploymentLevel != 'LCL'){
      //Automatically load user profile via OIDC
      console.log('App component....');
      this.oauthService.events
        .pipe(filter((e) => e.type === 'token_received'))
        .subscribe((_) => {
          console.log('access token', this.oauthService.getAccessToken());
          this.oauthService.loadUserProfile().then((userProfile)=>{
            console.log(userProfile);
            const userProfileObj = userProfile as UserProfile;
            localStorage.setItem('userProfile',JSON.stringify(userProfile));
            localStorage.setItem('username', userProfileObj.info.name);
            headerService.assignUserNameField(userProfileObj.info.name);


          });
          
        });
      //this.oauthService.setupAutomaticSilentRefresh();
      if (!sessionStorage.getItem('access_token')) {
        console.log('Here 2---');
        //sessionStorage.clear();
        this.configureCodeFlow();
        
      } else {
        this.access_token = sessionStorage.getItem('access_token');
        this._loaderSvc.hide();
          // localStorage.setItem('userProfile',JSON.stringify(userProfileUpdate));
        //sessionStorage.removeItem("access_token");
      }
    // }else{
    //   console.log('Environment: LCL');
    //   this._loaderSvc.hide();
    // }
    this.displayUsername();
   
  }

  private displayUsername(){
    const userName = localStorage.getItem('username') as string;
    console.log('Username in session: ' + userName);
    if(userName){
      this.headerService.assignUserNameField(userName);
    }
   
   
  }

  private configureCodeFlow() {
    this.oauthService.configure(authCodeFlowConfig);
    console.log('Here 3---');
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then((_) => {
      if (!sessionStorage.getItem('access_token')) {
        this.loginCode();
      } else {
        this.access_token = sessionStorage.getItem('access_token');
        console.log('Login attempt found access token: ' + this.access_token);
      }
      this._loaderSvc.hide();
    });
  }

  private async loginCode() {
    try {
      console.log('About to login');
      this.oauthService.configure(authCodeFlowConfig);
      await this.oauthService.loadDiscoveryDocument();
      sessionStorage.setItem('flow', 'code');
      this.oauthService.initLoginFlow('');
    } catch (err) {
      console.log('Error during login: ' + JSON.stringify(err));
    }
  }
}
