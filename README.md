# 🌐 Hadaka Electro - Angular Frontend

**Author:** [Ahmed Hadaka](https://www.linkedin.com/in/ahmed-hadaka-8a2124205/)  
**Backend Repository:** [HadakaElectroBackEnd](https://github.com/ahmed-hadaka/HadakaElectroBackEnd)  
**Live Portal Selector:** [Hadaka Electro (Vercel)](https://hadaka-electro-front-end-blond.vercel.app/)  
**Live:** [Customer Storefront Portal](https://hadaka-electro-front-end-blond.vercel.app/ElectroCustomer)  
**Live:** [Internal Admin Portal](https://hadaka-electro-front-end-blond.vercel.app/ElectroInternal)  

---

## 📖 Overview

**HadakaElectroFrontEnd** is a modern, modular Single Page Application (SPA) built with **Angular** (Standalone Architecture) and **TypeScript**. It serves as the unified frontend client for the **Hadaka Electro** e-commerce platform, consuming both the **Customer Storefront API** (`ElectroCustomerApi`) and the **Internal Admin API** (`ElectroInternalApi`) from the multi-module Spring Boot backend deployed on **Heroku**, with media assets served from **AWS S3**.

Starting from a unified **Portal Selector** landing page (`/`), the application is architected into two isolated portals—**Customer Storefront** and **Internal Admin Backoffice**—each with its own layout, navigation bar, lazy-loaded route tree, guards, and domain services, while sharing a unified core security layer (`csrf.interceptor.ts`, `CsrfService`, `AuthService`), notification system (`NotificationService`), and strongly-typed DTO models.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Angular (Standalone Components & Functional Routing via `app.config.ts` & `app.routes.ts`)
* **Language:** TypeScript
* **Styling:** HTML5, CSS3, Responsive Layout Design
* **HTTP & Security:** Angular `HttpClient`, Custom CSRF HTTP Interceptor (`csrf.interceptor.ts`), Route Guards (`auth-guard.ts`, `role-guard.ts`)
* **State & Reactive Streams:** RxJS (`Observables`, `finalize` loading lifecycles) & `ChangeDetectorRef`
* **Cloud & Hosting:** Vercel (Frontend SPA), Heroku (Spring Boot Backend APIs), AWS S3 (Cloud Media Assets)
* **Environments:** Multi-environment configuration (`environment.ts`, `environment.dev.ts`)

### System & Module Architecture Diagram

<pre>
+-----------------------------------------------------------------------------------+
|                 HadakaElectroFrontEnd (Angular SPA on Vercel)                     |
|                   Root Landing Page (/): Portal Selector UI                       |
+-----------------------------------------------------------------------------------+
                  |                                               |
                  v                                               v
+-----------------------------------+           +-----------------------------------+
|     Customer Storefront Portal    |           |      Internal Admin Portal        |
|        (customer.routes.ts)       |           |       (internal.routes.ts)        |
|-----------------------------------|           |-----------------------------------|
| - Layout: customer-layout &       |           | - Layout: internal-layout &       |
|   customer-nav-bar                |           |   internal-nav-bar                |
| - Guard: auth-guard.ts            |           | - Guard: role-guard.ts (RBAC)     |
| - Views: Home, products,          |           | - Views: dashboard (welcome),     |
|   product-details, shopping-cart, |           |   list/details for Users, Brands, |
|   checkout, address-form, orders, |           |   Categories, Products, Orders,   |
|   order-placed, login, register,  |           |   Customers, ShippingRates,       |
|   verify, forgot/reset-password   |           |   sales-report, settings          |
| - Services: CartService,          |           | - Services: UserService,          |
|   CheckoutService, orderService,  |           |   ProductService, BrandService,   |
|   addressBookService,             |           |   CategoryService, OrderService,  |
|   customerService                 |           |   CustomerService, SettingService,|
|                                   |           |   ShippingRateService,            |
|                                   |           |   SalesReportService              |
+-----------------------------------+           +-----------------------------------+
                  |                                               |
                  +-----------------------+-----------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        Shared & Core Layer (src/app/core & shared)                |
|-----------------------------------------------------------------------------------|
| - Security: csrf.interceptor.ts, CsrfService, AuthService                         |
| - UI Feedback: NotificationService & Non-Intrusive Loading Overlays (finalize)    |
| - Shared DTOs: ProductDTO, CategoryDTO, BrandDTO, UserDTO, CustomerDTO,           |
|   OrderDTO, OrderDetailsDTO, CartItemDTO, CheckoutDTO, AddressDTO,                |
|   ShippingRateDTO, PageModel                                                      |
+-----------------------------------------------------------------------------------+
                  |                                               |
     HTTPS / JSON + X-XSRF-TOKEN                     HTTPS / JSON + X-XSRF-TOKEN
       (withCredentials: true)                         (withCredentials: true)
                  |                                               |
                  v                                               v
+-----------------------------------+           +-----------------------------------+
|        ElectroCustomerApi         |           |        ElectroInternalApi         |
|  (Spring Boot on Heroku Dyno 1)   |           |  (Spring Boot on Heroku Dyno 2)   |
+-----------------------------------+           +-----------------------------------+
                  |                                               |
                  +-----------------------+-----------------------+
                                          |
                                          v
              +-------------------------------------------------------+
              |  JawsDB MySQL (Heroku)  |  AWS S3 (Media)  |  SMTP    |
              +-------------------------------------------------------+
</pre>

---

## 🚀 Key Features by Portal

### 🚪 0. Unified Portal Selector Landing Page (`/`)
* **Mode Selection Entry Point (`portal-selector`):** Serves as the root landing page matching the Hadaka Electro design system, allowing visitors and reviewers to seamlessly choose between the **Customer Shop Portal** (`/ElectroCustomer`) and the **Internal Control Panel** (`/ElectroInternal`).

### 🛒 1. Customer Storefront (`src/app/customer`)
* **Storefront & Catalog Browsing (`Home`, `products`, `productDetails`):** Dynamic category navigation, paginated product grids (`PageModel`), specification views, and product image galleries served from **AWS S3**.
* **Authentication & Account Lifecycle (`login`, `register`, `verify`, `forgotPassword`, `resetPassword`):** Session-based login, Google OAuth2 integration, new customer registration with Gmail SMTP email verification (`verify`), and token-based password recovery workflows.
* **Shopping Cart (`shopping-cart`, `CartService`):** Add products to cart, increment/decrement item quantities, calculate subtotals, and manage cart items (`CartItemDTO`).
* **Address Book Management (`address-form`, `addressBookService`):** Create, edit, and select shipping addresses (`AddressDTO`) with country/state lookups.
* **Checkout & Order Tracking (`checkout`, `order-placed`, `orders`, `CheckoutService`, `orderService`):** Shipping rate calculation, **PayPal**(still under development) and Cash-on-Delivery (COD) order confirmation (`CheckoutDTO`), order history inspection (`OrderDTO`), and return requests.

### ⚙️ 2. Internal Admin Portal (`src/app/internal`)
* **Role-Based Access Control (`role-guard.ts`, `internal-nav-bar`):** Restricts routes and navigation actions dynamically based on the logged-in staff member's roles (`Admin`, `Salesperson`, `Editor`, `Shipper`, `Assistant`).
* **Staff Management & Data Export (`listUsers`, `userDetails`, `UserService`):** Full CRUD for internal users (`UserDTO`), profile photo uploads to **AWS S3**, account status toggling, and one-click **CSV / Excel / PDF** export directly from the navigation bar (`exportUsersToPdf()`).
* **Catalog Management (`listBrands`/`brandDetails`, `listCategories`/`categoryDetails`, `listProducts`/`productDetails`):** Manage multi-level categories (`CategoryDTO`), brand logos (`BrandDTO`), and products (`ProductDTO`) with multi-image **AWS S3** uploads and inventory/pricing controls.
* **Customer & Order Fulfillment (`listCustomers`/`customerDetails`, `listOrders`/`viewOrderDetails`):** View and manage registered customers (`CustomerDTO`), inspect detailed order breakdowns (`OrderDetailsDTO`), and update order fulfillment statuses.
* **Shipping & Global Settings (`listShippingRate`/`shippingRateDetails`, `settings`):** Configure regional shipping rates and Cash-on-Delivery support (`ShippingRateDTO`), dynamic site logos, email templates, and currency settings (`SettingService`).
* **Sales Analytics (`sales-report`, `SalesReportService`):** Generate and visualize sales reports filtered by date ranges, categories, and products using Google Charts.

### 🔐 3. Core Security & Shared Infrastructure (`src/app/core` & `src/app/shared`)
* **CSRF Token Management (`csrf.interceptor.ts` & `CsrfService`):** Automatically intercepts state-changing HTTP requests (`POST`, `PUT`, `DELETE`, `PATCH`) and attaches the `X-XSRF-TOKEN` header alongside `withCredentials: true` for seamless cross-domain Spring Security integration between Vercel and Heroku.
* **Route Protection (`auth-guard.ts` & `role-guard.ts`):** Prevents unauthorized access to customer checkout/account views and protects internal administrative routes according to user roles.
* **Centralized Error & Notification Handling (`NotificationService`):** Standardized error parsing across components (`err.error?.message || err.error?.msg`) displayed via a reusable notification banner (`notification.html`).
* **Non-Intrusive UI Loading Overlays:** Component-level `isLoading` overlays powered by RxJS `finalize()` and `ChangeDetectorRef.detectChanges()` freeze the UI during asynchronous API calls and media uploads to prevent duplicate submissions, while ensuring overlays cleanly dismiss on errors and never obscure error notifications (`z-index` layered below alerts/modals).

---

## ☁️ Production Cloud Deployment
* **Frontend Hosting:** Deployed on **Vercel** with automatic builds from GitHub (`https://hadaka-electro-front-end-blond.vercel.app/`).
* **Backend Integration:** Configured via `src/environments/environment.ts` to communicate over HTTPS with the two **Heroku** Spring Boot dynos (`ElectroCustomerApi` and `ElectroInternalApi`) using credentialed cross-domain CORS/CSRF sessions.
* **Media Delivery:** Product galleries, category thumbnails, brand logos, and user avatars load directly via **AWS S3** URLs returned by the backend.

---

## 📂 Complete Project Structure

<pre>
HadakaElectroFrontEnd/
├── public/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── interceptors/
│   │   │   │   └── csrf.interceptor.ts         # Attaches CSRF token & credentials
│   │   │   └── auth-guard.ts                   # Protects authenticated customer routes
│   │   │
│   │   ├── portal-selector/                    # Unified root (/) mode selection landing page
│   │   │
│   │   ├── customer/                           # Customer Storefront Module
│   │   │   ├── components/
│   │   │   │   ├── address-form/               # Shipping address creation/editing
│   │   │   │   ├── checkout/                   # Order review & placement (PayPal / COD)
│   │   │   │   ├── customer-layout/            # Storefront wrapper layout
│   │   │   │   ├── customerNavBar/             # Storefront header & navigation
│   │   │   │   ├── forgotPassword/             # Password reset request view
│   │   │   │   ├── Home/                       # Storefront landing page
│   │   │   │   ├── login/                      # Customer login & OAuth2
│   │   │   │   ├── order-placed/               # Post-checkout confirmation screen
│   │   │   │   ├── orders/                     # Customer order history & tracking
│   │   │   │   ├── productDetails/             # Single product specs & gallery
│   │   │   │   ├── products/                   # Category & search product listings
│   │   │   │   ├── register/                   # Customer sign-up form
│   │   │   │   ├── resetPassword/              # Token-based password update form
│   │   │   │   ├── shopping-cart/              # Cart management view
│   │   │   │   └── verify/                     # Email verification confirmation
│   │   │   ├── services/
│   │   │   │   ├── addressBookService/         # address-book-service.ts
│   │   │   │   ├── CartService/                # cart-service.ts
│   │   │   │   ├── CheckoutService/            # checkout-service.ts
│   │   │   │   ├── customerService/            # customer-service.ts
│   │   │   │   └── orderService/               # order-service.ts
│   │   │   └── customer.routes.ts              # Customer portal routing table
│   │   │
│   │   ├── internal/                           # Internal Admin Backoffice Module
│   │   │   ├── components/
│   │   │   │   ├── brandDetails/               # Create/edit brand & S3 logo upload
│   │   │   │   ├── categoryDetails/            # Create/edit category & S3 image
│   │   │   │   ├── customerDetails/            # Edit customer details
│   │   │   │   ├── dashboard/                  # Admin welcome dashboard (welcome.ts)
│   │   │   │   ├── internal-layout/            # Admin portal wrapper layout
│   │   │   │   ├── internalNavBar/             # Role-aware admin navbar & PDF export
│   │   │   │   ├── listBrands/                 # Paginated brand management
│   │   │   │   ├── listCategories/             # Paginated category management
│   │   │   │   ├── listCustomers/              # Paginated customer management
│   │   │   │   ├── listOrders/                 # Order management table
│   │   │   │   ├── listProducts/               # Product catalog table & filters
│   │   │   │   ├── listShippingRate/           # Shipping rates table
│   │   │   │   ├── listUsers/                  # Internal staff user table
│   │   │   │   ├── productDetails/             # Multi-tab product editor & S3 images
│   │   │   │   ├── sales-report/               # Interactive sales analytics charts
│   │   │   │   ├── settings/                   # Store, mail & currency settings
│   │   │   │   ├── shippingRateDetails/        # Create/edit shipping rate
│   │   │   │   ├── userDetails/                # Create/edit staff user & roles
│   │   │   │   └── viewOrderDetails/           # Detailed order & status view
│   │   │   ├── services/
│   │   │   │   ├── BrandService/               # brand-service.ts
│   │   │   │   ├── CategoryService/            # category-service.ts
│   │   │   │   ├── CustomerService/            # customer-service.ts
│   │   │   │   ├── OrderService/               # order-service.ts
│   │   │   │   ├── ProductService/             # product-service.ts
│   │   │   │   ├── SalesReportService/         # sales-report-service.ts
│   │   │   │   ├── SettingService/             # setting-service.ts
│   │   │   │   ├── ShippingRateService/        # shipping-rate-service.ts
│   │   │   │   └── UserService/                # user-service.ts
│   │   │   ├── internal.routes.ts              # Internal admin routing table
│   │   │   └── role-guard.ts                   # RBAC route guard for admin views
│   │   │
│   │   ├── shared/                             # Shared Models & Cross-Cutting Services
│   │   │   ├── models/
│   │   │   │   ├── AddressDTO.ts
│   │   │   │   ├── BrandDTO.ts
│   │   │   │   ├── CartItemDTO.ts
│   │   │   │   ├── CategoryDTO.ts
│   │   │   │   ├── CheckoutDTO.ts
│   │   │   │   ├── CustomerDTO.ts
│   │   │   │   ├── OrderDetailsDTO.ts
│   │   │   │   ├── OrderDTO.ts
│   │   │   │   ├── PageModel.ts
│   │   │   │   ├── ProductDTO.ts
│   │   │   │   ├── ShippingRateDTO.ts
│   │   │   │   └── UserDTO.ts
│   │   │   └── services/
│   │   │       ├── AuthService/                # auth-service.ts
│   │   │       ├── CsrfService/                # csrf-service.ts
│   │   │       └── Notification/               # notification-service.ts & template
│   │   │
│   │   ├── app.config.ts                       # Root standalone providers & HTTP config
│   │   ├── app.routes.ts                       # Root router linking portal selector, customer & internal
│   │   ├── app.ts                              # Root application component
│   │   ├── app.html
│   │   └── app.css
│   │
│   ├── environments/
│   │   ├── environment.dev.ts                  # Development API URLs
│   │   └── environment.ts                      # Production (Heroku) environment config
│   ├── index.html
│   ├── main.ts                                 # Application bootstrap entry point
│   └── styles.css                              # Global stylesheet
├── angular.json
├── package.json
└── tsconfig.json
</pre>

---

## 💻 Local Setup & Installation

### Prerequisites
* **Node.js:** v18+
* **Angular CLI:** Installed globally (`npm install -g @angular/cli`)
* **Backend Server:** The `HadakaElectroBackEnd` modules (`ElectroCustomerApi` and `ElectroInternalApi`) and the `hadaka_electro_db` MySQL database must be running locally.

### Running the Frontend Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmed-hadaka/HadakaElectroFrontEnd.git
   cd HadakaElectroFrontEnd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify Environment Configuration:**
   Check `src/environments/environment.dev.ts` and `src/environments/environment.ts` to ensure the API base URLs match your running Spring Boot backend ports and context paths.

4. **Run the Angular development server:**
   ```bash
   ng serve
   ```

5. **Access the Portals Locally:**
   * **Portal Selector:** `http://localhost:4200/`
   * **Customer Storefront:** `http://localhost:4200/ElectroCustomer`
   * **Internal Admin Portal:** `http://localhost:4200/ElectroInternal`

