import {inject, Service} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserDTO,Page} from '../../Models/PageModel';
import {environmentDev} from '../../../environments/environment.dev';
import {Observable} from 'rxjs';

@Service()
export class UserService {

  private httpClient = inject(HttpClient);
  private usersBaseUrl = environmentDev.backendInternalBaseUrl+'/users'

  listAllUsers( keyword?: string,
                page:number = 0,
                size: number = 10,
                sort: string = 'id',
                direction: string = 'ASC'
  ): Observable<any> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('page', page.toString())
      .set('sort', sort)
      .set('direction', direction);

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.httpClient.get<Page<UserDTO>>(
      this.usersBaseUrl, {params}
    );
  }

  getCurUser(){
    const getUserUrl = this.usersBaseUrl+'/me';
    return this.httpClient.get<number>(getUserUrl);
  }

  saveUser(userDto:UserDTO, photoFile:File|null){
    const saveUserUrl = this.usersBaseUrl+'/save-user';

    const formData = new FormData();
    const userJson = new Blob([JSON.stringify(userDto)],{
      type:'application/json'
    })
    formData.append('user',userJson);
    if(photoFile === null){
      formData.append('photo',new Blob([]));
    }else
      formData.append('photo', photoFile,photoFile?.name);

    return this.httpClient.post<Record<string, string>>(
      saveUserUrl,
      formData
      )
  }

  deleteUser(userId:number=0){
    const deleteUserUrl = this.usersBaseUrl+'/delete/'+userId;
    return this.httpClient.delete<{message:string}>(deleteUserUrl);
  }

  getUserById(userId:number =0) {
    const getUserByIdUrl = this.usersBaseUrl+'/'+userId;
    return this.httpClient.get<UserDTO>(getUserByIdUrl);
  }

  updateEnableStatus(userId:number=0){
    const updateEnableStatusUrl = this.usersBaseUrl+'/update-enable-status/'+userId;
    return this.httpClient.patch<string>(updateEnableStatusUrl,null,{responseType:'text'});
  }

  exportUsersToPdf(){
    const exportToPdfUrl = this.usersBaseUrl+'/export/pdf';
    return this.httpClient.get(exportToPdfUrl,{responseType:'blob'});
  }
}
