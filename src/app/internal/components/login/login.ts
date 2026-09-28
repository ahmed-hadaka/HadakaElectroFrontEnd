import { Component,inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginRequestDTO} from '../../../shared/Models/LoginRequestDTO';
import {AuthService} from '../../../shared/services/AuthService/auth-service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';
import {environmentDev} from '../../../../environments/environment.dev';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})


export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  loginReqForm = this.fb.group(
    {
      email:['',[Validators.required, Validators.email]],
      password:['', [Validators.required]],
      rememberMe:[false]
    }
  )

  onSubmit(){

    if(this.loginReqForm.valid){
      const loginReqDTO :LoginRequestDTO=this.loginReqForm.value as LoginRequestDTO;
      const loginUrl = environmentDev.backendInternalBaseUrl+'/auth/login';

      this.authService.login(loginReqDTO,loginUrl).subscribe({
        next:(data:Record<string, any>)=>{

          sessionStorage.setItem('userEmail',data['Email']);
          sessionStorage.setItem('userRoles',JSON.stringify(data['Roles']));


          this.loginReqForm.reset();
          this.router.navigate(['ElectroInternal/users']).then(()=>{
            // Full browser window refresh
            window.location.reload();
          })

        },
        error: (err) => {
          const message =
            err.error?.message ||
            err.error?.msg ||
            (typeof err.error === 'string' ? err.error : null) ||
            'An unexpected error occurred while Login';
          this.notification.notify(message,'danger')
        }
      })
    }else{
      this.notification.notify("invalid input",'danger')
    }
  }

}
