# 🌐 Hadaka Electro - Angular Frontend

**Author:** [Ahmed Hadaka](https://www.linkedin.com/in/ahmed-hadaka-8a2124205/)  
**Backend Repository:** [HadakaElectroBackEnd](https://github.com/ahmed-hadaka/HadakaElectroBackEnd)  
**Live:** [Customer Storefront Portal](https://hadaka-electro-front-end-blond.vercel.app/ElectroCustomer)  
**Live:** [Internal Admin Portal](https://hadaka-electro-front-end-blond.vercel.app/ElectroInternal)  
**Demo Video:** [Watch the Demo Video Here](#) *(Recording in progress)*

---

## 📖 Overview

**HadakaElectroFrontEnd** is a modern, modular Single Page Application (SPA) built with **Angular** (Standalone Architecture) and **TypeScript**. It serves as the unified frontend client for the **Hadaka Electro** e-commerce platform, consuming both the **Customer Storefront API** (`ElectroCustomerApi`) and the **Internal Admin API** (`ElectroInternalApi`) from the multi-module Spring Boot backend.

The application is architected into two isolated portals—**Customer Storefront** and **Internal Admin Backoffice**—each with its own layout, navigation bar, lazy-loaded route tree, guards, and domain services, while sharing a unified core security layer (`csrf.interceptor.ts`, `CsrfService`, `AuthService`), notification system (`NotificationService`), and strongly-typed DTO models.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Angular (Standalone Components & Functional Routing via `app.config.ts` & `app.routes.ts`)
* **Language:** TypeScript
* **Styling:** HTML5, CSS3, Responsive Layout Design
* **HTTP & Security:** Angular `HttpClient`, Custom CSRF HTTP Interceptor (`csrf.interceptor.ts`), Route Guards (`auth-guard.ts`, `role-guard.ts`)
* **State & Reactive Streams:** RxJS (`Observables`)
* **Environments:** Multi-environment configuration (`environment.ts`, `environment.dev.ts`)

### System & Module Architecture Diagram

<pre>
+-----------------------------------------------------------------------------------+
|                      HadakaElectroFrontEnd (Angular SPA)                          |
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
| - UI Feedback: NotificationService (Global toast/alert notifications)             |
| - Shared DTOs: ProductDTO, CategoryDTO, BrandDTO, UserDTO, CustomerDTO,           |
|   OrderDTO, OrderDetailsDTO, CartItemDTO, CheckoutDTO, AddressDTO,                |
|   ShippingRateDTO, PageModel                                                      |
+-----------------------------------------------------------------------------------+
                  |                                               |
     HTTP / JSON + X-XSRF-TOKEN                      HTTP / JSON + X-XSRF-TOKEN
       (withCredentials: true)                         (withCredentials: true)
                  |                                               |
                  v                                               v
+-----------------------------------+           +-----------------------------------+
|        ElectroCustomerApi         |           |        ElectroInternalApi         |
|       (Spring Boot Backend)       |           |       (Spring Boot Backend)       |
+-----------------------------------+           +-----------------------------------+
</pre>

---

## 🚀 Key Features by Portal

### 🛒 1. Customer Storefront (`src/app/customer`)
* **Storefront & Catalog Browsing (`Home`, `products`, `productDetails`):** Dynamic category navigation, paginated product grids (`PageModel`), specification views, and product image galleries.
* **Authentication & Account Lifecycle (`login`, `register`, `verify`, `forgotPassword`, `resetPassword`):** Session-based login, Google OAuth2 integration, new customer registration with email verification (`verify`), and token-based password recovery workflows.
* **Shopping Cart (`shopping-cart`, `CartService`):** Add products to cart, increment/decrement item quantities, calculate subtotals, and manage cart items (`CartItemDTO`).
* **Address Book Management (`address-form`, `addressBookService`):** Create, edit, and select shipping addresses (`AddressDTO`) with country/state lookups.
* **Checkout & Order Tracking (`checkout`, `order-placed`, `orders`, `CheckoutService`, `orderService`):** Shipping rate calculation, Cash-on-Delivery (COD) order confirmation (`CheckoutDTO`), order history inspection (`OrderDTO`), and return requests.

### ⚙️ 2. Internal Admin Portal (`src/app/internal`)
* **Role-Based Access Control (`role-guard.ts`, `internal-nav-bar`):** Restricts routes and navigation actions dynamically based on the logged-in staff member's roles (`Admin`, `Salesperson`, `Editor`, `Shipper`, `Assistant`).
* **Staff Management & Data Export (`listUsers`, `userDetails`, `UserService`):** Full CRUD for internal users (`UserDTO`), profile photo uploads, account status toggling, and one-click **CSV / PDF** export directly from the navigation bar (`exportUsersToPdf()`).
* **Catalog Management (`listBrands`/`brandDetails`, `listCategories`/`categoryDetails`, `listProducts`/`productDetails`):** Manage multi-level categories (`CategoryDTO`), brand logos (`BrandDTO`), and products (`ProductDTO`) with multi-image uploads and inventory/pricing controls.
* **Customer & Order Fulfillment (`listCustomers`/`customerDetails`, `listOrders`/`viewOrderDetails`):** View and manage registered customers (`CustomerDTO`), inspect detailed order breakdowns (`OrderDetailsDTO`), and update order fulfillment statuses.
* **Shipping & Global Settings (`listShippingRate`/`shippingRateDetails`, `settings`):** Configure regional shipping rates and Cash-on-Delivery support (`ShippingRateDTO`), dynamic site logos, email templates, and currency settings (`SettingService`).
* **Sales Analytics (`sales-report`, `SalesReportService`):** Generate and visualize sales reports filtered by date ranges, categories, and products.

### 🔐 3. Core Security & Shared Infrastructure (`src/app/core` & `src/app/shared`)
* **CSRF Token Management (`csrf.interceptor.ts` & `CsrfService`):** Automatically intercepts state-changing HTTP requests (`POST`, `PUT`, `DELETE`, `PATCH`) and attaches the `X-XSRF-TOKEN` header alongside `withCredentials: true` for seamless Spring Security integration.
* **Route Protection (`auth-guard.ts` & `role-guard.ts`):** Prevents unauthorized access to customer checkout/account views and protects internal administrative routes according to user roles.
* **Centralized Error & Notification Handling (`NotificationService`):** Standardized error parsing across components (`err.error?.message || err.error?.msg`) displayed via a reusable notification banner (`notification.html`).

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
│   │   ├── customer/                           # Customer Storefront Module
│   │   │   ├── components/
│   │   │   │   ├── address-form/               # Shipping address creation/editing
│   │   │   │   ├── checkout/                   # Order review & placement
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
│   │   │   │   ├── brandDetails/               # Create/edit brand & logo upload
│   │   │   │   ├── categoryDetails/            # Create/edit category & image
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
│   │   │   │   ├── productDetails/             # Multi-tab product editor & images
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
│   │   ├── app.routes.ts                       # Root router linking customer & internal
│   │   ├── app.ts                              # Root application component
│   │   ├── app.html
│   │   └── app.css
│   │
│   ├── environments/
│   │   ├── environment.dev.ts                  # Development API URLs
│   │   └── environment.ts                      # Default/Production environment config
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

5. **Access the Portals:**
   * **Customer Storefront:** `https://hadaka-electro-front-end-blond.vercel.app/ElectroCustomer`
   * **Internal Admin Portal:** `https://hadaka-electro-front-end-blond.vercel.app/ElectroInternal`
