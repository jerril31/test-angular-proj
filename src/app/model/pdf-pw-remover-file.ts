
export interface FileDetails {
  fileName: string;
  fileKey: string;
  fileSize: number;
  location: string;
  lastUpdated: Date;
}

export interface FileResults {
  successFiles: Array<FileDetails>;
  errorFiles: Array<FileDetails>;
}

export interface S3Result {
  LISTBUCKETRESULT: S3Bucket;
}
export interface S3Bucket {
  NAME: string;
  CONTENTS: Array<S3Content>;
}

export interface S3Content {
  KEY: string;
  SIZE: string;
  LASTMODIFIED: Date;
}


export interface UserProfile {
  info: UserInfo;
}

export interface UserInfo{
  ppr: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  station: string;
  name: string;
}

