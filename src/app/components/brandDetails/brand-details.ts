import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BrandService } from '../../services/BrandService/brand-service';
import { BrandDTO } from '../../Models/BrandDTO';
import { CategorySelectDTO } from '../../Models/CategoryDTO';
import { NotificationService } from '../../services/NotificationService/notification-service';
import { environmentDev } from '../../../environments/environment.dev';


@Component({
  selector: 'app-brand-details',
  templateUrl: './brand-details.html',
  styleUrl: './brand-details.css',
  imports: [
    ReactiveFormsModule,
  ]
})
export class BrandDetails {
  private router = inject(Router);
  private brandService = inject(BrandService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  brandLogoBasePath = environmentDev.backendInternalBaseUrl + '/brand_logos/';
  defaultLogoPath = environmentDev.backendInternalBaseUrl + '/default_images/default-brand.png';

  brandDtoSignal = signal<BrandDTO | null>(null);
  categoriesSignal = signal<CategorySelectDTO[]>([]);
  logoFile: File | null = null;

  protected brandForm = this.fb.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(2)]],
    logo: [''],
    categories: new FormControl<number[]>([], { nonNullable: true }) // Holds array of selected IDs
    });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const brandId = Number(params.get('id'));

      if (brandId && brandId > 0) {
        this.loadBrand(brandId);
      } else {
        this.brandForm.reset({
          id:0,
          name: '',
          logo:'',
        });
        this.loadFormData();
        this.brandDtoSignal.set(null);
      }
    });
  }

  get selectedCategoryIds(): number[] {
    return this.brandForm.get('categories')?.value || [];
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  onCategoryChange(event: Event, categoryId: number): void {
    const checkbox = event.target as HTMLInputElement;
    const currentValues = [...this.selectedCategoryIds];

    if (checkbox.checked) {
      if (!currentValues.includes(categoryId)) {
        currentValues.push(categoryId);
      }
    } else {
      const index = currentValues.indexOf(categoryId);
      if (index !== -1) {
        currentValues.splice(index, 1);
      }
    }

    // Update form control value
    this.brandForm.patchValue({ categories: currentValues });
    this.brandForm.get('categories')?.markAsDirty();
  }

  private loadBrand(id: number) {
    this.brandService.getEditBrandData(id).subscribe({
      next: (data) => {
        this.brandDtoSignal.set(data.brand);
        this.categoriesSignal.set(data.categories);


        const assignedIds = data.brand.categories
          ? data.brand.categories.map(cat => cat.id)
          : [];

        this.brandForm.patchValue({
          id: data.brand.id,
          name: data.brand.name,
          logo: data.brand.logo,
          categories: assignedIds
        });
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
    this.brandService.getNewBrandFormData().subscribe({
      next: (data) => {
        this.categoriesSignal.set(data);
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
      this.logoFile = input.files[0];
      this.brandForm.patchValue({
        logo: this.logoFile.name
      })
    }
  }

  protected onSubmit() {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      this.notification.notify('Error in input fields. Please provide valid inputs.', 'danger');
      return;
    }

    const formData = new FormData();
    const brandDto:BrandDTO = this.fillPayload();
    formData.append('brand', new Blob([JSON.stringify(brandDto)], { type: 'application/json' }));

    if (this.logoFile) {
      formData.append('imageFile', this.logoFile);
    }

    this.brandService.saveBrand(formData).subscribe({
      next: (data) => {
        this.notification.notify(data, 'success');
        this.router.navigate(['/brands']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private fillPayload(): any {
    const formValues = this.brandForm.value;
    const brand: BrandDTO = {
      id:formValues.id!,
      name: formValues.name!,
      logo: this.logoFile?.name || formValues.logo || undefined,
      categories: formValues.categories?.flatMap(catId => {
        const found = this.categoriesSignal().find(cat => cat.id === catId);
        return found ? [found] : []; // Keeps only valid CategorySelectDTO objects
      }) ?? []
    };

    return brand;
  }

  protected getLogoPath(): string {
    const brand = this.brandDtoSignal();
    if (brand && brand.logo) {
      return `${this.brandLogoBasePath}${brand.id}/${brand.logo}`;
    }
    return this.defaultLogoPath;
  }

  protected onCancel() {
    this.router.navigate(['/brands']);
  }
}
