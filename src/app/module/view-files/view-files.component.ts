import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/layout/loader/loader.service';
import {
  FileDetails,
  S3Bucket,
  S3Result,
} from 'src/app/model/pdf-pw-remover-file';
import { PdfPwRemoverService } from 'src/app/service/pdf-pw-remover.service';
import { saveAs } from 'file-saver';
import { MessageService } from 'primeng/api';
// declare var require: any;
// const FileSaver = require('file-saver');

@Component({
  selector: 'app-view-files',
  templateUrl: './view-files.component.html',
  styleUrls: ['./view-files.component.css'],
  providers: [MessageService],
})
export class ViewFilesComponent implements OnInit {
  fileList: Array<FileDetails> = [];
  errorFileList: Array<FileDetails> = [];

  constructor(
    private pdfPwRemoverService: PdfPwRemoverService,
    private _loaderSvc: LoaderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this._loaderSvc.show();
    this.messageService.clear();
    this.retrieveAllFiles();
  }

  downloadFile(location: string, fileName: string) {
    this._loaderSvc.show();
    this.messageService.clear();
    this.pdfPwRemoverService
      .retrieveFile(location, fileName)
      .subscribe({
        next: (data) => {
          console.log('here');
          console.log(data);
          saveAs(data, fileName);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: `Download Failed`,
            detail: `Error occured while downloading file ${fileName}. Error: ${error.message}.`,
          });
        },
      })
      .add(() => {
        this._loaderSvc.hide();
      });
  }

  private retrieveAllFiles(): void {
    this.pdfPwRemoverService
      .retrieveAllFiles()
      .subscribe({
        next: (response) => this.handleRetrievalResponse(response),
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: `Upload Failed`,
            detail: `Error occured while retrieving files . Error: ${error.message}.`,
          });
        },
      })
      .add(() => {
        this._loaderSvc.hide();
      });
  }

  private handleRetrievalResponse(response: any) {
    console.log(response);

    if (response.isError) {
      console.log(response);
      console.log(response.data);
      this.addRetrievalErrorMessage('Converted Files', response.data.message);
    } else {
      let resultFilesObj = this.pdfPwRemoverService.extractBucketContents(
        response.data
      );
      this.fileList = resultFilesObj.successFiles;
      this.errorFileList = resultFilesObj.errorFiles;
    }
    // let convertedFileList = responseArray[0];
    // let errorFileList = responseArray[1];
    // //Converted Files
    // if (convertedFileList.isError) {
    //   console.log(convertedFileList);
    //   console.log(convertedFileList.data);
    //   this.addRetrievalErrorMessage(
    //     'Converted Files',
    //     convertedFileList.data.message
    //   );
    // } else {
    //   let resultFilesObj = this.pdfPwRemoverService.extractBucketContents(
    //     convertedFileList.data
    //   );
    //   this.fileList = resultFilesObj.successFiles;
    //   this.errorFileList = resultFilesObj.errorFiles;
    // }
    // //Error Files
    // if (errorFileList.isError) {
    //   console.log(errorFileList);
    //   console.log(errorFileList.data);
    //   this.addRetrievalErrorMessage('Error File', errorFileList.data.message);
    // } else {
    //   this.errorFileList = this.pdfPwRemoverService.extractBucketContents(
    //     errorFileList.data
    //   );
    // }
  }

  private addRetrievalErrorMessage(filesType: string, erroMsg: any) {
    this.messageService.add({
      severity: 'error',
      summary: `Retrieval Error`,
      detail: `Error occured while retrieving ${filesType}. Error: ${erroMsg}.`,
    });
  }
}
