import { Component } from '@angular/core';
import { authCodeFlowConfig } from './auth-code-flow.config';
import { filter } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { HeaderService } from './layout/header/header/header.service';
import {
  UserProfile
} from './model/pdf-pw-remover-file';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'pdf-pw-remover';

  access_token: any = '';

  constructor(private oauthService: OAuthService, headerService: HeaderService) {

   if(environment.appDeploymentLevel != 'LCL'){
    //Automatically load user profile via OIDC
    console.log('App component....');
    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe((_) => {
        console.log('Here 1---');
        console.log('access token', this.oauthService.getAccessToken());
        this.oauthService.loadUserProfile().then((userProfile)=>{
          console.log(userProfile);
          const userProfileObj = userProfile as UserProfile;
            localStorage.setItem('userProfile',JSON.stringify(userProfile));
          headerService.assignUserNameField(userProfileObj.info.name)


        });
        
      });
    if (!sessionStorage.getItem('access_token')) {
      console.log('Here 2---');
      //sessionStorage.clear();
      this.configureCodeFlow();
      
    } else {
      console.log('Here 3---');
      this.access_token = sessionStorage.getItem('access_token');
      
        // localStorage.setItem('userProfile',JSON.stringify(userProfileUpdate));
      //sessionStorage.removeItem("access_token");
    }
   }else{
     console.log('Environment: LCL');
   }
   
  }

  private configureCodeFlow() {
    console.log('Here 4---');
    this.oauthService.configure(authCodeFlowConfig);
    console.log('Here 5---');
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then((_) => {
      console.log('Here 6---');
      if (!sessionStorage.getItem('access_token')) {
        console.log('Here 7---');
        this.loginCode();
      } else {
        console.log('Here 8---');
        this.access_token = sessionStorage.getItem('access_token');
        console.log('Login attempt found access token: ' + this.access_token);
      }
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
