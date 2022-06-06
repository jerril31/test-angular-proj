import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppConstant } from './constant/app.constant';
import { UploadFilesComponent } from './module/upload-files/upload-files.component';
import { ViewFilesComponent } from './module/view-files/view-files.component';

const routes: Routes = [
  {
    //View Files
    path: AppConstant.URL_VIEW_CONVERTED_FILES,
    component: ViewFilesComponent,
  },
  {
    //Upload Files
    path: AppConstant.URL_UPLOAD_FILES,
    component: UploadFilesComponent,
  },
  {
    //Callback after OIDC
    path: AppConstant.URL_CALLBACK,
    component: UploadFilesComponent
  },
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
