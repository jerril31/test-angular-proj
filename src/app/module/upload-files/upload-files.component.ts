import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { AppConstant } from 'src/app/constant/app.constant';
import { LoaderService } from 'src/app/layout/loader/loader.service';
import { PdfPwRemoverService } from 'src/app/service/pdf-pw-remover.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css'],
  providers: [MessageService],
})
export class UploadFilesComponent implements OnInit {
  uploadedFiles: any[] = [];
  showViewResultButton: boolean = true;
  env: string = 'dev';
  constructor(
    private router: Router,
    private pdfPwRemoverService: PdfPwRemoverService,
    private _loaderSvc: LoaderService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {}
  onUpload(event: any) {
    this._loaderSvc.show();
    this.messageService.clear();
    const files = event.files;

    let uploads$: Observable<any>[] = [];
    //Iterate all files. Put all observable to an array
    for (let file of event.files) {
      console.log(file.name);
      let fileName = file.name;
      //uploadResults$.push(this.pdfPwRemoverService.uploadFile(file));
      uploads$.push(
        this.pdfPwRemoverService.uploadFile(file).pipe(
          map(
            (data: any) => this.handleSuccessUpload(data, fileName)
            // console.log(data);
            // this.messageService.add({
            //   severity: 'success',
            //   summary: 'Upload Success',
            //   detail: `File ${fileName} successfully uploaded.`,
            // });
            // return { isError: false, response: data };
          ),
          catchError((err) => this.handleErrorUpload(err, fileName))
          //{
          // console.log(err);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: `Upload Failed`,
          //   detail: `Error occured while uploading ${fileName}. Error:${err.message}.`,
          // });
          // return of({ isError: true, response: err });
          //})
        )
      );
    }

    this.processAllUploadsuploads(uploads$);
  }
  private processAllUploadsuploads(uploads$: Observable<any>[]) {
    //Wait for all uploads to emit.
    //If atleast one of the uploads failed, stay on the upload page and display all success and error messages.
    //Also, show View Result Page button so the user can still go to the Result Page
    //Otherwise, if all files are successfull uploaded, forward to result page.
    let withError = false;
    forkJoin(uploads$)
      .subscribe({
        next: (responseArray) => {
          console.log(responseArray);

          responseArray.forEach((res) => {
            if (res.isError) {
              console.log(res);
              console.log(res.response);
              withError = true;
            } else {
              this.showViewResultButton = true;
              console.log('Success:');
              console.log(res);
              console.log(res.response);
            }
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: `Upload Failed`,
            detail: `Error occured while uploading file(s) . Error: ${error.message}.`,
          });
        },
      })
      .add(() => {
        //No Error. Forwad to result page.
        if (!withError) {
          //wait before moving to next page, to allow lamda processing
          setTimeout(() => {
            this._loaderSvc.hide();
            this.router.navigate([AppConstant.URL_VIEW_CONVERTED_FILES]);
          }, 30000);
        } else {
          this._loaderSvc.hide();
        }
      });
  }

  private handleSuccessUpload(data: any, fileName: any) {
    console.log(data);
    this.messageService.add({
      severity: 'success',
      summary: 'Upload Success',
      detail: `File ${fileName} successfully uploaded and will be queued for processing.`,
    });
    return { isError: false, response: data };
  }

  private handleErrorUpload(err: HttpErrorResponse, fileName: any) {
    console.log(err);
    this.messageService.add({
      severity: 'error',
      summary: `Upload Failed`,
      detail: `Error occured while uploading ${fileName}. Error:${err.message}.`,
    });
    return of({ isError: true, response: err });
  }

  clearAll() {
    this.messageService.clear();
    this.showViewResultButton = false;
  }

  goToResultsPage() {
    this.router.navigate([AppConstant.URL_VIEW_CONVERTED_FILES]);
  }
}
