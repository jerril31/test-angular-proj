import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  validateUserGroup(){
    const userProfile= localStorage.getItem('userProfile') as string;
   
    if(userProfile){
      const userProfileObj = JSON.parse(userProfile);
      const groupInfo = userProfileObj.info.group_info;
      console.log("Group info:" + groupInfo);
      if(groupInfo && groupInfo.includes(environment.validUserGroup) ){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }
}




