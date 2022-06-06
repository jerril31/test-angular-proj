import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class HeaderInterceptor implements HttpInterceptor {

    constructor(private oauthService: OAuthService) {
      console.log('Intercepting here ..');
    }

    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      console.log('Intercepting here 2..');
      // const API_KEY = 'lf48y64wrb3ACENgLlJ6B5FHobcPPZWP9go7PpyW';

      // let headers = { 'x-api-key': API_KEY, 'Content-Type': 'application/json' };

      const token = this.oauthService.getAccessToken();

      console.log('Intercepting call: ' + token);

      // const headers = { 'Content-Type': 'application/json' };
      // /* eslint-disable dot-notation,@typescript-eslint/dot-notation */
      // headers['Authorization'] = `Bearer ${token}`;
      // /* eslint-enable dot-notation, @typescript-eslint/dot-notation */

      //return next.handle(httpRequest.clone({ setHeaders: headers}));
      return next.handle(httpRequest);
    }
}
