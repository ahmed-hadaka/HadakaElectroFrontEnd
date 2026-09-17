import { Component,inject } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoginRequestDTO} from '../../services/AuthService/LoginRequestDTO';
import {AuthService} from '../../services/AuthService/auth-service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {NotificationService} from '../../services/NotificationService/notification-service';

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
      this.authService.login(loginReqDTO).subscribe({
        next:(data:Record<string, string>)=>{

          sessionStorage.setItem('userEmail',data['Email']);
          sessionStorage.setItem('userRole',data['Role']);


          this.loginReqForm.reset();
          this.router.navigate(['/users']).then(()=>{
            // Full browser window refresh
            window.location.reload();
          })

        },
        error: (err) => {
          const message =
            err.error?.message ||
            err.error?.msg ||
            (typeof err.error === 'string' ? err.error : null) ||
            'An unexpected error occurred.';

          this.notification.notify(message,'danger')
        }
      })
    }else{
      this.notification.notify("invalid input",'danger')
    }
  }

}
