import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { AppConstant } from '../constant/app.constant';
import { environment } from 'src/environments/environment';
import {
  FileDetails,
  FileResults,
  S3Result,
} from '../model/pdf-pw-remover-file';
import * as xml2js from 'xml2js';
import { concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PdfPwRemoverService {
  constructor(private http: HttpClient) {}

  retrieveAllFiles(): Observable<any> {
    return this.retrieveConvertedFiles().pipe(
      map((data: any) => {
        return { isError: false, data: data };
      }),
      catchError((err) => {
        console.log(err);
        return of({ isError: true, data: err });
      })
    );
  }

  extractBucketContents(xmlResponseString: String) {
    //console.log(xmlResponseString);
    let successFileList = new Array<FileDetails>();
    let errorFileList = new Array<FileDetails>();
    let s3Result = this.parseXml(xmlResponseString) as S3Result;
    if (s3Result.LISTBUCKETRESULT.CONTENTS !== undefined) {
      for (let content of s3Result.LISTBUCKETRESULT.CONTENTS) {
        console.log(content.KEY);
        //S3 File Key which includes folder name
        let s3Key: string = content.KEY.toString();
        //Get actual file name minus the folder name
        let viewFilename: string = s3Key.slice(s3Key.lastIndexOf('/') + 1);
        //Build File obj out of record
        let fileDetails = {
          fileName: viewFilename,
          fileKey: content.KEY,
          fileSize: +content.SIZE,
          location: s3Result.LISTBUCKETRESULT.NAME,
          lastUpdated: content.LASTMODIFIED,
        } as FileDetails;
        //Check filename is present (folder object or files outisde the folders will have blank viewFilename )
        if (viewFilename !== '' && viewFilename !== undefined) {
          //Add to correct file list based on folder location
          if (s3Key.startsWith(AppConstant.PROCESS_FOLDER_SUCCESS)) {
            successFileList.push(fileDetails);
          } else if (s3Key.startsWith(AppConstant.PROCESS_FOLDER_ERROR)) {
            errorFileList.push(fileDetails);
          }
        }
      }
    }
    var fileResults = {
      successFiles: successFileList,
      errorFiles: errorFileList,
    } as FileResults;
    return fileResults;
  }

  private parseXml(xmlResponseString: String): any {
    const parser = new xml2js.Parser({ strict: false, trim: true });
    let jsonResult;
    parser.parseString(xmlResponseString, (err: any, result: any) => {
      jsonResult = result;
    });
    return jsonResult;
  }

  retrieveConvertedFiles(): Observable<any> {
    return this.http.get(
      `${environment.awsApiGwS3BaseUrl}${environment.convertedFilesBucket}`,
      { responseType: 'text' }
    );
  }
  /**
   * Retrieve Presigned URL for Upload from API Gateway
   * Using Presigned URL, upload file to S3.
   *
   * @param file
   * @returns
   */
  uploadFileViaPresignedUrl(file: File): Observable<any> {
    const headers = new HttpHeaders();
    const requestOptions: Object = {
      headers: headers,
    };
    console.log('Uploading via presignedURL..');
    return this.http
      .get(
        `${environment.awsApiGwS3BaseUrl}s3/${environment.uploadedFilesBucket}/${file.name}`,
        { params: new HttpParams().set('method', 'PUT') }
      )
      .pipe(
        concatMap((res: any) => {
          //console.log(res);
          return this.http.put(res.presignedUrl, file, requestOptions);
        })
      );
  }

  // uploadFile(file: File): Observable<any> {
  //   console.log('Uploading via API Gateway..');
  //   const headers = new HttpHeaders();
  //   const requestOptions: Object = {
  //     headers: headers,
  //   };
  //   return this.http.put(
  //     `${environment.awsApiGwS3BaseUrl}${environment.uploadedFilesBucket}/${file.name}`,
  //     file,
  //     requestOptions
  //   );
  // }

  // retrieveFile(location: string, fileName: string): Observable<any> {
  //   const headers = new HttpHeaders().set('accept', 'application/pdf');
  //   const requestOptions: Object = {
  //     headers: headers,
  //   };
  //   let encodedFilename = encodeURIComponent(fileName);
  //   return this.http
  //     .get(`${environment.awsApiGwS3BaseUrl}${location}/${encodedFilename}`, {
  //       headers: headers,
  //       responseType: 'blob',
  //     })
  //     .pipe(
  //       map((res) => {
  //         console.log(res);
  //         return new Blob([res], { type: 'application/pdf' });
  //       })
  //     );
  // }

  /**
   * Retrieve Presigned URL for Upload from API Gateway
   * Using Presigned URL, download file from S3.
   * @param location
   * @param fileName
   * @returns
   */
  retrieveFileViaPresignedUrl(
    location: string,
    fileName: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('accept', 'application/pdf');
    const requestOptions: Object = {
      headers: headers,
    };
    let encodedFilename = encodeURIComponent(fileName);
    //Get presigned URL for Download and then make a call on the presigned URL
    return this.http
      .get(
        `${environment.awsApiGwS3BaseUrl}s3/${environment.convertedFilesBucket}/${encodedFilename}`,
        { params: new HttpParams().set('method', 'GET') }
      )
      .pipe(
        concatMap((res: any) => {
          //console.log(res);
          
          return this.http
            .get(res.presignedUrl, {
              headers: headers,
              responseType: 'blob',
            })
            .pipe(
              map((res) => {
                console.log(res);
                return new Blob([res], { type: 'application/pdf' });
              })
            );
        })
      );
  }
}
