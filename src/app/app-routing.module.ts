import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppConstant } from './constant/app.constant';
import { UnauthorizedComponent } from './module/unauthorized/unauthorized.component';
import { UploadFilesComponent } from './module/upload-files/upload-files.component';
import { ViewFilesComponent } from './module/view-files/view-files.component';
import { AuthguardService } from './service/authguard.service';

const routes: Routes = [
  {
    //View Files
    path: AppConstant.URL_VIEW_CONVERTED_FILES,
    component: ViewFilesComponent,  canActivate: [AuthguardService]
  },
  {
    //Upload Files
    path: AppConstant.URL_UPLOAD_FILES,
    component: UploadFilesComponent, canActivate: [AuthguardService]
  },
  {
    //Callback after OIDC
    path: AppConstant.URL_CALLBACK,
    component: UploadFilesComponent, canActivate: [AuthguardService]
  },
  {
    //Unauthorized page
    path: AppConstant.URL_UNAUTHORIZED,
    component: UnauthorizedComponent
  },
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
