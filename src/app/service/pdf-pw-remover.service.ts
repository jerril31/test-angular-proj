import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  subscribeOn,
  throwError,
} from 'rxjs';
import { ApiConstant } from '../constant/api.constant';
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

    // let response1 = this.retrieveConvertedFiles().pipe(
    //   map((data: any) => {
    //     return { isError: false, data: data };
    //   }),
    //   catchError((err) => {
    //     console.log(err);
    //     return of({ isError: true, data: err });
    //   })
    // );
    // let response2 = this.retrieveErrorFiles().pipe(
    //   map((data: string) => {
    //     return { isError: false, data: data };
    //   }),
    //   catchError((err) => {
    //     return of({ isError: true, data: err });
    //   })
    // );
    // return forkJoin([response1, response2]);
  }

  extractBucketContents(xmlResponseString: String) {
    console.log(xmlResponseString);
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
    // return of(
    //   '<?xml version="1.0" encoding="UTF-8"?> <ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>oem-converted-files</Name><Prefix></Prefix><Marker></Marker><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated><Contents><Key>001 - 0000 - 33-2438-9-0002.pdf</Key><LastModified>2022-02-03T14:56:26.000Z</LastModified><ETag>&quot;c1a4509d4af8a91fa87e1ec8ebc8d175&quot;</ETag><Size>1077926</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>2021 Q3 PI Planning Agenda (1).pptx</Key><LastModified>2022-02-03T14:56:26.000Z</LastModified><ETag>&quot;f77790453483a4113e3f3c8aba622efd&quot;</ETag><Size>56423</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>D-41872_2040-0031_PNL CRD-Retest-2.pdf</Key><LastModified>2022-02-04T15:28:01.000Z</LastModified><ETag>&quot;0d378e59454eab0b3c86662fe39db746&quot;</ETag><Size>2921968</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents></ListBucketResult>'
    // );
    return this.http.get(
      `${environment.awsApiGwS3BaseUrl}${environment.convertedFilesBucket}`,
      { responseType: 'text' }
    );
  }
  // retrieveErrorFiles(): Observable<any> {
  //   // return of(
  //   //   '<?xml version="1.0" encoding="UTF-8"?><ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>oem-error-files</Name><Prefix></Prefix><Marker></Marker><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated><Contents><Key>2060-9612-01.pdf</Key><LastModified>2022-02-03T14:57:12.000Z</LastModified><ETag>&quot;b5fabe4c01369040f5be1c5a33fff847&quot;</ETag><Size>362888</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>AC 3308_001 - 0215 - 2040-0035.pdf</Key><LastModified>2022-02-03T14:57:14.000Z</LastModified><ETag>&quot;c18dc8c107839060ff6f3b44a2e6cb33&quot;</ETag><Size>1126945</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>AC 5653 Tally Report.pdf</Key><LastModified>2022-02-03T14:57:14.000Z</LastModified><ETag>&quot;6c045c93d4256aaae087f9101fc3d917&quot;</ETag><Size>471776</Size><Owner><ID>999c06573dd05885d48e03ec64a3095f246e74eb2a1e6f58a5123bc675192942</ID></Owner><StorageClass>STANDARD</StorageClass></Contents></ListBucketResult>'
  //   // );
  //   return this.http.get(
  //     `${this.retrieveServerBaseURL()}${
  //       ApiConstant.URL_PATH_ERROR_PDF_FILES_BUCKET
  //     }-${this.env}`,
  //     { responseType: 'text' }
  //   );
  // }

  uploadFileViaPresignedUrl(file: File): Observable<any> {
    const headers = new HttpHeaders();
    const requestOptions: Object = {
      headers: headers,
    };
    console.log('Uploading via presignedURL..');
    //TODO: API Gateway 500 and 400 response
    return this.http
      .get(
        `${environment.awsApiGwS3BaseUrl}s3/${environment.uploadedFilesBucket}/${file.name}`,
        { params: new HttpParams().set('method', 'PUT') }
      )
      .pipe(
        concatMap((res: any) => {
          console.log(res);
          return this.http.put(res.presignedUrl, file, requestOptions);
        })
      );
  }

  uploadFile(file: File): Observable<any> {
    // if (file.name === 'sample123.pdf') {
    //   return this.http.put(
    //     `${ApiConstant.URL_AWS_API_GATEWAY_BASE}${ApiConstant.URL_PATH_UPLOADED_FILES_BUCKET}/${file.name}`,
    //     file
    //   );
    //   //return of('Success');
    // } else {
    //   return this.http.put(
    //     `https://inw9635js9.execute-api.ap-southeast-1.amazonaws.com/dev/${ApiConstant.URL_PATH_UPLOADED_FILES_BUCKET}X/${file.name}`,
    //     file
    //   );
    // }
    const headers = new HttpHeaders();
    // headers.append(' Access-Control-Allow-Headers', 'Content-Type');
    // headers.append('Content-Type', 'application/pdf');
    // headers.append('content-type', 'application/pdf');
    // headers.append('Accept', 'application/pdf');
    // headers.append('access-control-allow-methods', 'GET, POST, OPTIONS, PUT');
    const requestOptions: Object = {
      headers: headers,
    };
    return this.http.put(
      `${environment.awsApiGwS3BaseUrl}${environment.uploadedFilesBucket}/${file.name}`,
      file,
      requestOptions
    );
    // return this.http.put(
    //   `${ApiConstant.URL_AWS_API_GATEWAY_BASE}${ApiConstant.URL_PATH_UPLOADED_FILES_BUCKET}/${file.name}`,
    //   file
    // );
  }

  retrieveFile(location: string, fileName: string): Observable<any> {
    const headers = new HttpHeaders().set('accept', 'application/pdf');
    // .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT')
    // .set('Access-Control-Allow-Origin', '*');
    const requestOptions: Object = {
      headers: headers,
    };
    let encodedFilename = encodeURIComponent(fileName);
    return this.http
      .get(`${environment.awsApiGwS3BaseUrl}${location}/${encodedFilename}`, {
        // //.get(
        //   `${ApiConstant.URL_AWS_API_GATEWAY_BASE}${location}/testerror1.pdf`,
        //  {
        headers: headers,
        responseType: 'blob',
      })
      .pipe(
        map((res) => {
          console.log(res);
          return new Blob([res], { type: 'application/pdf' });
        })
      );
  }

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
          console.log(res);
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
