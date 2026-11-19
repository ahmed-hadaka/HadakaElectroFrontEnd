import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import {UserService} from '../../services/UserService/user-service';
import {UserDTO, Page} from '../../../shared/Models/PageModel';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {environmentDev} from '../../../../environments/environment.dev';
import {NotificationService, NotifyType} from '../../../shared/services/NotificationService/notification-service';
import {finalize} from 'rxjs';

@Component({
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    RouterLink
  ],
  selector: 'app-list-users',
  styleUrl: './list-users.css',
  templateUrl: './list-users.html',
})
export class ListUsers {
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);
  usersPageContent = signal<UserDTO[]|null>(null);
  userPhotoBasePath =environmentDev.backendInternalBaseUrl+ '/user_photos/';
  defaultUserPhotoBasePath =environmentDev.backendInternalBaseUrl+ '/default_images/';
  private fb = inject(FormBuilder);

  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);

  searchForm!: FormGroup;
  public isLoading = false;
  protected notification = inject(NotificationService);


  ngOnInit() {
    this.initializeForm();
    this.loadUsers();
  }


  private initializeForm() {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }


  loadUsers(page:number = 0){
    const keyword:string = this.searchForm.get('keyword')?.value || '';

    this.isLoading = true;
    this.cdr.detectChanges();
    this.userService.listAllUsers(keyword,page,this.pageSize())
      .pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })) // Unfreeze UI
      .subscribe({
      next:(data)=>{
        this.usersPageContent.set(data.content);
        this.totalPages.set(data.totalPages);
        this.currentPage.set(page);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message,'danger')
      }
    })
  }

  userIdToDelete = signal<number | null>(null)


  onSearch() {
    this.loadUsers(0);
  }


  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadUsers(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadUsers(this.currentPage() - 1);
    }
  }


  confirmDelete(id: number): void {
    this.userIdToDelete.set(id);
  }

  executeDelete(): void {
    const id = this.userIdToDelete();
    if (!id) return;

    this.deleteUser(id);
  }

  cancelDelete(): void {
    this.userIdToDelete.set(null);
  }

  private deleteUser(id: number=0) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.userService.deleteUser(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next:(data)=>{
        this.notification.notify(data.message,'success')
        this.userIdToDelete.set(null);
        this.loadUsers();//refresh
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message,'danger')
      }
    })
  }

  protected updateEnableStatus(id: number) {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.userService.updateEnableStatus(id).pipe(finalize(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next:(data:string)=>{
        this.notification.notify(data,'success');
        this.loadUsers();
      },
      error:(err)=>{
        this.isLoading = false;
        this.cdr.detectChanges();
        const message =
          err.error?.message ||
          err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';

        this.notification.notify(message,'danger')
      }
    })
  }
}