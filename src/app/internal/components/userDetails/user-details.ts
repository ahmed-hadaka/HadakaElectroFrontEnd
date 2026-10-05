import {Component, computed, inject, signal} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule, ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms'
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {UserService} from '../../services/UserService/user-service';

import {NgOptimizedImage} from '@angular/common';
import {UserDTO, Role, APP_ROLES} from '../../../shared/Models/PageModel';
import {environmentDev} from '../../../../environments/environment.dev';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';

export const atLeastOneRoleValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const admin = control.get('admin')?.value;
  const editor = control.get('editor')?.value;
  const salesPerson = control.get('salesPerson')?.value;
  const shipper = control.get('shipper')?.value;
  const assistant = control.get('assistant')?.value;

  const hasAtLeastOne = admin || editor || salesPerson || shipper || assistant;
  return hasAtLeastOne ? null : {requiredRole: true};
};

@Component({
  imports: [
    ReactiveFormsModule,
    // NgOptimizedImage,
    FormsModule,
    NgOptimizedImage,
    RouterLink
  ],
  selector: 'app-user-details',
  styleUrl: './user-details.css',
  templateUrl: './user-details.html',
})


export class UserDetails {
  private router = inject(Router);
  private userService = inject(UserService);
  // userId = signal<number | null>(null);
  private route = inject(ActivatedRoute);
  userPhotoBasePath =environmentDev.backendInternalBaseUrl+ '/user_photos/';
  defaultUserPhotoBasePath =environmentDev.backendInternalBaseUrl+ '/default_images/';
  photoMultipart: File | null = null;
  fb = inject(FormBuilder);

  userDtoSignal = signal<UserDTO | null>(null);

  protected userForm = this.fb.group({
    id: [''],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    password: [''],
    enabled: [false],
    photo: [''],
    rolesGroup: this.fb.group({
      admin: [false],
      editor: [false],
      salesPerson: [false],
      shipper: [false],
      assistant: [false]
    }, {validators: atLeastOneRoleValidator})
  })
  private notification = inject(NotificationService);


  ngOnInit() {
    // Listen for route parameter changes
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));

      if (userId !== null && userId > 0) {
        this.loadUser(userId);
      }else {
        this.userForm.reset();
        this.userDtoSignal.set(null)
      }
    })
  }

  private loadUser(id:number=0){
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.userDtoSignal.set(data)
        // Patch values into the reactive form once data arrives
        this.userForm.patchValue({
          id: "" + data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          enabled: data.enabled,
          photo: data.photo,
          rolesGroup: {
            admin: this.hasRole(1),
            salesPerson: this.hasRole(2),
            editor: this.hasRole(3),
            shipper: this.hasRole(4),
            assistant: this.hasRole(5)
          }
        });
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
  }

  protected onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.photoMultipart = input.files[0];
    }
  }

  protected hasRole(id: number = 0) {
    const roles = this.userDtoSignal()?.roles;
    if (roles) {
      for (const role of roles) {
        if (role.id === id)
          return true;
      }
    }
    return false;

  }

  private fillPayload():UserDTO{

    const formValues = this.userForm.value;
    const user: Partial<UserDTO> = {};

    user.id = Number(formValues.id!);
    user.email = formValues.email!;
    user.firstName = formValues.firstName!;
    user.lastName = formValues.lastName!;
    user.password = formValues.password ?? undefined;
    user.enabled = formValues.enabled ?? false;
    user.photo = this.photoMultipart?.name ?? formValues.photo??undefined;

    const selectedRoles: Role[] = [];

    if (formValues.rolesGroup?.admin) selectedRoles.push(APP_ROLES[0]);
    if (formValues.rolesGroup?.salesPerson) selectedRoles.push(APP_ROLES[1]);
    if (formValues.rolesGroup?.editor) selectedRoles.push(APP_ROLES[2]);
    if (formValues.rolesGroup?.shipper) selectedRoles.push(APP_ROLES[3]);
    if (formValues.rolesGroup?.assistant) selectedRoles.push(APP_ROLES[4]);

    user.roles = selectedRoles;
    return user as UserDTO;
  }

  protected onSubmit() {

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notification.notify("Error in input fields, Please make sure to provide valid inputs", 'danger')
      return;
    }

    const userDto = this.fillPayload()

    this.userService.saveUser(userDto, this.photoMultipart).subscribe({
      next: (data) => {
        this.notification.notify(data['message'],'success')
        this.router.navigate(['ElectroInternal/users'])
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
  }

  protected readonly APP_ROLES = APP_ROLES;
}
