import { Component, OnInit, signal } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ProductDetail} from '../../../shared/Models/ProductDTO';
import {ProductService} from '../../services/ProductService/product-service';
import {environmentDev} from '../../../../environments/environment.dev';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';

export interface ExtraImageSlot {
  id?: number;
  name?: string;
  file?: File;
  previewUrl: string;
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.html',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  styleUrls: ['./product-details.css']
})
export class ProductDetails {

  productForm!: FormGroup;

  // Signals
  protected productDtoSignal = signal<any | null>(null);
  protected brandsSignal = signal<any[]>([]);
  protected categoriesSignal = signal<any[]>([]);
  protected productDetailsSignal = signal<ProductDetail[]>([]);
  protected extraImageSlotsSignal = signal<ExtraImageSlot[]>([]);
  protected removedImagesNamesSignal = signal<string[]>([]);

  // Image handling properties
  protected mainImageFile: File | null = null;
  protected mainImagePreviewUrl: string | null = null;
  protected defaultImagePath = environmentDev.backendInternalBaseUrl + '/default_images/default-product.png';
  protected productImageBasePath =  environmentDev.backendInternalBaseUrl + '/product_images/';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private productService:ProductService,
    private notification:NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if editing an existing product or creating a new one
    const productId = this.route.snapshot.params['id'];
    if (productId) {
      this.loadProductForEdit(productId);
    } else {
      this.loadDropdownDataForNewProduct();
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(3)]],
      alias: ['', [Validators.required, Validators.minLength(3)]],
      brandId: [0, [Validators.required, Validators.min(1)]],
      categoryId: [0, [Validators.required, Validators.min(1)]],
      enabled: [true],
      inStock: [true],
      cost: [0.0, [Validators.required, Validators.min(0)]],
      price: [0.0, [Validators.required, Validators.min(0)]],
      mainImage:['',[Validators.required]],
      discountPercent: [0.0, [Validators.min(0), Validators.max(100)]],
      shortDescription: ['', [Validators.required]],
      fullDescription: [''],
      length: [0.0],
      width: [0.0],
      height: [0.0],
      weight: [0.0]
    });
  }

  // --- Loaders ---
  private loadDropdownDataForNewProduct(): void {
    this.productService.getNewProductFormData().subscribe({
      next: (res) => {
        this.brandsSignal.set(res.brands || []);
        this.categoriesSignal.set(res.categories || []);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to load new product initial data';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private loadProductForEdit(id: number): void {
    this.productService.getEditProductData(id).subscribe({
      next: (res) => {
        const product = res.product;
        this.productDtoSignal.set(product);
        this.brandsSignal.set(res.brands || []);
        this.categoriesSignal.set(res.categories || []);

        // Patch reactive form values
        this.productForm.patchValue({
          id: product.id,
          name: product.name,
          alias: product.alias,
          brandId: product.brandId,
          categoryId: product.categoryId,
          enabled: product.enabled,
          inStock: product.inStock,
          cost: product.cost,
          price: product.price,
          mainImage:product.mainImage,
          discountPercent: product.discountPercent,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          length: product.length,
          width: product.width,
          height: product.height,
          weight: product.weight
        });

        // Populate Product Details
        if (product.productDetails) {
          this.productDetailsSignal.set(product.productDetails);
        }

        // Populate Existing Extra Images
        if (product.productImages && product.productImages.length > 0) {
          const existingSlots: ExtraImageSlot[] = product.productImages.map((img: any) => ({
            id: img.id,
            name: img.name,
            previewUrl: `${this.productImageBasePath}${product.id}/extras/${img.name}`
          }));
          this.extraImageSlotsSignal.set(existingSlots);
        }
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Error fetching product for editing';
        this.notification.notify(message, 'danger');
      }
    });
  }

  // --- Main Image Methods ---
  protected onMainImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.mainImageFile = input.files[0];
      this.mainImagePreviewUrl = URL.createObjectURL(this.mainImageFile);
      this.productForm.patchValue({
        mainImage: this.mainImageFile.name
      })
    }
  }

  protected getMainImagePath(): string {
    if (this.mainImagePreviewUrl) {
      return this.mainImagePreviewUrl;
    }
    const product = this.productDtoSignal();
    if (product && product.mainImage) {
      return `${this.productImageBasePath}${product.id}/${product.mainImage}`;
    }
    return this.defaultImagePath;
  }

  // --- Dynamic Extra Image Slots (Up to 5) ---
  protected addExtraImageSlot(): void {
    if (this.extraImageSlotsSignal().length < 5) {
      this.extraImageSlotsSignal.update(slots => [
        ...slots,
        { previewUrl: this.defaultImagePath }
      ]);
    }
  }

  protected onExtraImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const previewUrl = URL.createObjectURL(selectedFile);

      this.extraImageSlotsSignal.update(slots => {
        const copy = [...slots];
        copy[index] = {
          ...copy[index],
          file: selectedFile,
          previewUrl
        };
        return copy;
      });
    }
  }

  protected removeExtraImage(index: number, name: string): void {
    this.removedImagesNamesSignal.update(names =>{
      if(names.length > 0){
       return [...names,name];
      }else{
        return [name];
      }
    });

    this.extraImageSlotsSignal.update(slots => {
      const slot = slots[index];
      if (slot?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
      return slots.filter((_, i) => i !== index);
    });
  }

  // --- Dynamic Details Tab Logic ---
  protected addDetail(): void {
    this.productDetailsSignal.update(details => [...details, { name: '', value: '' }]);
  }

  protected updateDetailName(event: Event, index: number): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.productDetailsSignal.update(details => {
      const copy = [...details];
      copy[index].name = inputValue;
      return copy;
    });
  }

  protected updateDetailValue(event: Event, index: number): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.productDetailsSignal.update(details => {
      const copy = [...details];
      copy[index].value = inputValue;
      return copy;
    });
  }

  protected removeDetail(index: number): void {
    this.productDetailsSignal.update(details => details.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
     this.notification.notify('Please fill out all required fields before saving.',"danger");
      return;
    }

    const formData = new FormData();

    // 1. Prepare Product DTO object
    const productDto = {
      ...this.productForm.value,
      mainImage:this.mainImageFile?.name || this.productForm.value.mainImage || 'no image',
      productDetails: this.productDetailsSignal().filter(d => d.name.trim() !== '' && d.value.trim() !== ''),
      productImages:this.extraImageSlotsSignal().map(imageSlot =>{imageSlot.name})
    };

    // Append Product DTO as JSON blob matching @RequestPart("product")
    const productBlob = new Blob([JSON.stringify(productDto)], { type: 'application/json' });
    formData.append('product', productBlob);

    // 2. Append main image matching @RequestPart(value = "main_image")
    if (this.mainImageFile) {
      formData.append('main_image', this.mainImageFile);
    }

    // 3. Append extra images matching @RequestPart(value = "extra_images")
    const extraFilesToUpload = this.extraImageSlotsSignal()
      .map(slot => slot.file)
      .filter((file): file is File => file !== undefined);

    extraFilesToUpload.forEach(file => {
      formData.append('extra_images', file);
    });

    if(this.removedImagesNamesSignal()){ //todo
      for (const imageName of this.removedImagesNamesSignal()) {
        formData.append('removed_images_names',imageName
          // new Blob([JSON.stringify(imageName)], { type: 'application/json' })
        );
      }
    }

    // Send HTTP POST request
    this.productService.saveProduct(formData).subscribe({
      next: (response) => {
        this.notification.notify("product saved successfully","success")
        this.router.navigate(['ElectroInternal/products']);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An error occurred while saving product';
        this.notification.notify(message, 'danger');
      }
    });
  }
}
