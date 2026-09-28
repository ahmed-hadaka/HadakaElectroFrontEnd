import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/CustomerService/customer-service';
import { CategoryListDTO } from '../../../shared/Models/CategoryDTO';
import { GeneralSettingDTO } from '../../../shared/Models/CustomerDTO';
import { environmentDev } from '../../../../environments/environment.dev';
import { CustomerNavBar } from '../customerNavBar/customer-nav-bar';
import { NotificationService } from '../../../shared/services/NotificationService/notification-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CustomerNavBar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private customerService = inject(CustomerService);
  private notification = inject(NotificationService);

  currentPage = signal(0);
  totalPages = signal(0);
  categories = signal<CategoryListDTO[]>([]);
  siteName = signal('Hadaka⚡Electro');
  categoryImageBasePath = environmentDev.backendCustomerBaseUrl;

  ngOnInit() {
    const storedSettings = sessionStorage.getItem('siteSettings');

    if (storedSettings) {
      const settings: GeneralSettingDTO[] = JSON.parse(storedSettings);
      const siteNameSetting = settings.find(setting => setting.key === 'SITE_NAME');

      if (siteNameSetting) {
        this.siteName.set(siteNameSetting.value);
      }
    }

    this.loadCategories(0);
  }


  private loadCategories(page:number) {
    this.customerService.getCategories(page, 12).subscribe({
      next: (categories) => {
        this.totalPages.set(categories.totalPages);
        this.currentPage.set(page);
        this.categories.set(categories.content);
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while loading categories';
        this.notification.notify(message, 'danger');
      }
    });
  }


  nextPage() {
    const response = this.categories();
    if (response && this.currentPage() < this.totalPages() - 1) {
      this.loadCategories(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.loadCategories(this.currentPage() - 1);
    }
  }

  getImagePath(category: CategoryListDTO): string {
    if (!category.image) {
      return environmentDev.backendCustomerBaseUrl + '/default_images/default-category.png';
    }
    return `${this.categoryImageBasePath}/${category.id}/${category.image}`;
  }
}
