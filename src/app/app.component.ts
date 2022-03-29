import { Component } from '@angular/core';
import { authCodeFlowConfig } from './auth-code-flow.config';
import { filter } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'pdf-pw-remover';

  access_token: any = '';

  constructor(private oauthService: OAuthService) {
    // Automatically load user profile
    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe((_) => {
        this.oauthService.loadUserProfile();
        console.debug('access token', this.oauthService.getAccessToken());
      });

    if (!sessionStorage.getItem('access_token')) {
      //sessionStorage.clear();
      this.configureCodeFlow();
    } else {
      this.access_token = sessionStorage.getItem('access_token');
      console.log('Constructor Access Token = ' + this.access_token);
      //sessionStorage.removeItem("access_token");
    }
  }

  private configureCodeFlow() {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then((_) => {
      if (!sessionStorage.getItem('access_token')) {
        this.loginCode();
      } else {
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
