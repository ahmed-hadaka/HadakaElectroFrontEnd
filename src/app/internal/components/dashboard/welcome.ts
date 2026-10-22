import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {SettingService} from '../../services/SettingService/setting.service';
import {CsrfService} from '../../../shared/services/CsrfService/csrf-service';
import {GeneralAndCurrencySettingsResponse, SettingDTO} from '../../../shared/Models/SettingDTO';
import {NotificationService} from '../../../shared/services/NotificationService/notification-service';

interface QuickModule {
  title: string;
  description: string;
  route: string;
  icon: string;
  colorClass: string;
  allowedRoles: string[];
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
  imports: [RouterLink, DatePipe],
})
export class Welcome implements OnInit {
  userName = signal<string>('Team Member');
  userRoles = signal<string[]>([]);
  greeting = signal<string>('Welcome back');
  currentDate = new Date();

  // Modules automatically filtered based on the logged-in user's roles
  private readonly allModules: QuickModule[] = [
    {
      title: 'Users Management',
      description: 'Manage staff accounts, assign roles, and control internal system permissions.',
      route: '/ElectroInternal/users',
      icon: '👥',
      colorClass: 'icon-indigo',
      allowedRoles: ['Admin'],
    },
    {
      title: 'Categories',
      description: 'Organize product hierarchies, parent-child categories, and visibility.',
      route: '/ElectroInternal/categories',
      icon: '🗂️',
      colorClass: 'icon-teal',
      allowedRoles: ['Admin', 'Editor'],
    },
    {
      title: 'Brands',
      description: 'Maintain manufacturer profiles, logos, and associated category mappings.',
      route: '/ElectroInternal/brands',
      icon: '🏷️',
      colorClass: 'icon-amber',
      allowedRoles: ['Admin', 'Editor'],
    },
    {
      title: 'Products Catalog',
      description: 'Browse inventory, update pricing and stock, or inspect product specifications.',
      route: '/ElectroInternal/products',
      icon: '📦',
      colorClass: 'icon-blue',
      allowedRoles: ['Admin', 'Editor', 'Salesperson', 'Shipper'],
    },
    {
      title: 'Orders & Fulfillment',
      description: 'Track customer orders, manage invoices, and update delivery statuses.',
      route: '/ElectroInternal/orders',
      icon: '🚚',
      colorClass: 'icon-emerald',
      allowedRoles: ['Admin', 'Salesperson', 'Shipper'],
    },
    {
      title: 'Shipping Rates',
      description: 'Configure regional delivery rates, transit days, and COD availability.',
      route: '/ElectroInternal/shipping-rates',
      icon: '🌍',
      colorClass: 'icon-cyan',
      allowedRoles: ['Admin', 'Salesperson'],
    },
    {
      title: 'Customers',
      description: 'View registered customer profiles, contact details, and account activity.',
      route: '/ElectroInternal/customers',
      icon: '🤝',
      colorClass: 'icon-purple',
      allowedRoles: ['Admin', 'Salesperson'],
    },
    {
      title: 'System Settings',
      description: 'Configure currency formats, mail servers, and global store preferences.',
      route: '/ElectroInternal/settings',
      icon: '⚙️',
      colorClass: 'icon-rose',
      allowedRoles: ['Admin'],
    },
  ];

  accessibleModules = signal<QuickModule[]>([]);
  private settingService = inject(SettingService);
  notification = inject(NotificationService)

  copyrights = signal('');

  ngOnInit(): void {

    if(!sessionStorage.getItem("siteSettings")) {
      this.loadSettings();
    }

    this.loadCopyrights();


    this.setGreetingByTime();
    this.loadUserSession();
  }

  private setGreetingByTime(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting.set('Good Morning');
    } else if (hour < 18) {
      this.greeting.set('Good Afternoon');
    } else {
      this.greeting.set('Good Evening');
    }
  }

  private loadUserSession(): void {
    // Load user name if stored in sessionStorage
    const storedName = sessionStorage.getItem('userEmail');
    if (storedName) {
      this.userName.set(storedName.replace(/^"|"$/g, ''));
    }

    try {
      const rawRoles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
      const roles: string[] = rawRoles.map((r: any) => (r.authority ? r.authority : r));
      this.userRoles.set(roles);

      // Filter modules that match at least one of the user's roles
      const filtered = this.allModules.filter((mod) =>
        mod.allowedRoles.some((role) => roles.includes(role))
      );
      this.accessibleModules.set(filtered.length > 0 ? filtered : this.allModules);
    } catch {
      this.accessibleModules.set(this.allModules);
    }
  }


  private loadSettings() {
    this.settingService.getGeneralAndCurrencySettings().subscribe({
      next: (settings:GeneralAndCurrencySettingsResponse) => {
        sessionStorage.setItem('siteSettings', JSON.stringify(settings.generalSettings));
      },
      error: (err) => {
        const message = err.error?.message || err.error?.msg ||
          (typeof err.error === 'string' ? err.error : null) ||
          'An unexpected error occurred while loading settings.';
        this.notification.notify(message, 'danger');
      }
    });
  }

  private loadCopyrights() {
    const settings: SettingDTO[] = JSON.parse(sessionStorage.getItem('siteSettings')!);

    const copyrightSetting = settings?.find(setting => setting.key === 'COPYRIGHT');

    if (copyrightSetting) {
      this.copyrights.set(copyrightSetting.value);
    }
  }
}
