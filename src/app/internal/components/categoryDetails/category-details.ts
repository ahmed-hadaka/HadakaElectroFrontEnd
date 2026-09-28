import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/CategoryService/category-service';
import { CategoryListDTO, CategorySelectDTO } from '../../../shared/Models/CategoryDTO';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';
import { environmentDev } from '../../../../environments/environment.dev';
import { NgIf, NgForOf } from '@angular/common';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.html',
  styleUrl: './category-details.css',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ]
})
export class CategoryDetails {
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  categoryImageBasePath = environmentDev.backendInternalBaseUrl + '/category_images/';
  defaultImagePath = environmentDev.backendInternalBaseUrl + '/default_images/default-category.png';

  categoryDtoSignal = signal<CategoryListDTO | null>(null);
  parentCategoriesSignal = signal<CategorySelectDTO[]>([]);
  imageFile: File | null = null;

  protected categoryForm = this.fb.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(2)]],
    alias: ['', [Validators.required, Validators.minLength(2)]],
    image: ['',[Validators.required]],
    parent: new FormControl<CategorySelectDTO | null>(null),
    enabled: [false]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const categoryId = Number(params.get('id'));

      if (categoryId && categoryId > 0) {
        this.loadCategory(categoryId);
      } else {
        this.loadFormData();
        this.categoryForm.reset({
          id: 0,
          name: '',
          alias: '',
          image: '',
          parent: null,
          enabled: false
        });
        this.categoryDtoSignal.set(null);
      }
    });
  }

  private loadCategory(id: number) {
    this.categoryService.getEditCategoryData(id).subscribe({
      next: (data) => {
        this.categoryDtoSignal.set(data.category);
        this.parentCategoriesSignal.set(data.categories);

        // Find the exact object reference from parentCategoriesSignal that matches data.category.parent.id
        const selectedParent = data.category.parent
          ? this.parentCategoriesSignal().find(p => p.id === data.category.parent?.id) ?? null
          : null;

    this.categoryForm.patchValue({
      id: data.category.id,
      name: data.category.name,
      alias: data.category.alias,
      image: data.category.image,
      parent: selectedParent,
      enabled: data.category.enabled
    } );
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private loadFormData() {
    this.categoryService.getNewCategoryFormData().subscribe({
      next: (data) => {
        this.parentCategoriesSignal.set(data);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  protected onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.categoryForm.patchValue({
        image: this.imageFile.name,
      })
    }
  }

  protected onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.notification.notify('Error in input fields. Please provide valid inputs.', 'danger');
      return;
    }

    const formData = new FormData();
    const categoryDto = this.fillPayload();
    formData.append('category', new Blob([JSON.stringify(categoryDto)], { type: 'application/json' }));

    if (this.imageFile) {
      formData.append('imageFile', this.imageFile);
    }

    this.categoryService.saveCategory(formData).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.router.navigate(['ElectroInternal/categories']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private fillPayload(): Partial<CategoryListDTO> {
    const formValues = this.categoryForm.value;
    const category : Partial<CategoryListDTO> = {};

    category.id = Number(formValues.id);
    category.name= formValues.name!;
    category.alias= formValues.alias!;
    category.image= this.imageFile?.name || formValues.image!;
    category.parent= formValues.parent || null;
    category.enabled= formValues.enabled || false

    return category;
  }

  protected getImagePath(): string {
    const category = this.  categoryDtoSignal();
    if (category && category.image) {
      return `${this.categoryImageBasePath}${category.id}/${category.image}`;
    }
    return this.defaultImagePath;
  }

  protected getParentCategoryName(): string {
    const category = this.categoryDtoSignal();
    if (category && category.parent) {
      return category.parent.name;
    }
    return 'None';
  }

}
