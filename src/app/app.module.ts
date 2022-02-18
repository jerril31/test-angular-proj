import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { ViewFilesComponent } from './module/view-files/view-files.component';

import { UploadFilesComponent } from './module/upload-files/upload-files.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderComponent } from './layout/loader/loader.component';
import { NgxFilesizeModule } from 'ngx-filesize';

@NgModule({
  declarations: [
    AppComponent,
    ViewFilesComponent,
    UploadFilesComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
    TableModule,
    FileUploadModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxFilesizeModule,
    DividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
