<div align="center">

# HadakaElectro Frontend

### A polished Angular storefront and operations workspace for a full-stack electronics platform

<p>
  <a href="https://github.com/ahmed-hadaka/HadakaElectroFrontEnd">
    <img src="https://img.shields.io/github/stars/ahmed-hadaka/HadakaElectroFrontEnd?style=for-the-badge&logo=github&label=Stars" alt="GitHub stars">
  </a>
  <img src="https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 22">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5.3">
</p>

<p>
  <a href="https://github.com/ahmed-hadaka/HadakaElectroBackend">Backend services</a>
  ·
  <a href="#run-the-application">Run locally</a>
  ·
  <a href="#application-structure">Application structure</a>
</p>

</div>

## Product overview

HadakaElectro Frontend is the Angular client for a complete electronics commerce platform. It brings two experiences into one maintainable application:

- **Customer storefront** for discovery, authentication, cart management, checkout, addresses, and order history
- **Internal operations portal** for catalog, customer, order, shipping, user, settings, and sales-report management

The application is organized around real business workflows, with route-level role protection, shared HTTP services, typed models, CSRF handling, and reusable layouts.

## Experience map

```text
                         HadakaElectro Frontend
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
      /ElectroCustomer                       /ElectroInternal
                │                                   │
     ┌──────────▼──────────┐           ┌──────────▼──────────┐
     │     Storefront       │           │   Operations portal   │
     │ Browse · Cart · Buy  │           │ Manage · Fulfill     │
     └──────────┬──────────┘           └──────────┬──────────┘
                │                                   │
                └───────────────┬───────────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │ Spring Boot backend services │
                 │ Customer API :8081           │
                 │ Internal API :8080           │
                 └──────────────────────────────┘
```

## Features

### Customer storefront

- Category browsing, keyword search, and product detail pages
- Registration, account verification, login, password reset, and Google sign-in
- Shopping cart quantity updates, removal, and shipping-availability checks
- Address book management
- Checkout and order placement
- Order history, detail views, and return requests

### Internal portal

- Dashboard with authenticated user context and role-aware navigation
- Role guards for `Admin`, `Editor`, `Salesperson`, `Shipper`, and `Assistant`
- Product, category, brand, customer, user, order, and shipping-rate management
- General settings, country/state configuration, and payment settings
- Sales reports with date, category, and product visualizations
- Bootstrap-based data-entry and detail workflows

## Technical highlights

- Angular standalone application with lazy-loaded customer and internal route trees
- Typed TypeScript models and service-oriented API integration
- Functional HTTP interceptors for authentication and CSRF headers
- Session-aware customer and internal layouts
- Google Charts integration for operational reporting
- Bootstrap 5 UI foundation with project-specific styling
- Unit tests colocated with components and services using Angular’s test tooling

## Application structure

```text
src/app/
├── core/
│   └── interceptors/       # Authentication and CSRF request handling
├── customer/
│   ├── components/         # Storefront, account, cart, checkout, and orders
│   ├── services/           # Customer-facing API services
│   └── customer.routes.ts
├── internal/
│   ├── components/         # Admin and operations portal
│   ├── services/           # Catalog, order, user, settings, and report APIs
│   ├── internal-role-guard.ts
│   └── internal.routes.ts
└── shared/
    ├── Models/             # Shared request and response types
    └── services/           # Auth, CSRF, and notification services
```

## Run the application

### Prerequisites

- Node.js and npm
- The companion [HadakaElectroBackend](https://github.com/ahmed-hadaka/HadakaElectroBackend) services running locally

The development environment currently expects:

| Service | URL |
| --- | --- |
| Customer API | `http://localhost:8081/ElectroCustomer` |
| Internal API | `http://localhost:8080/ElectroInternal` |
| Angular app | `http://localhost:4200` |

### Install dependencies

```bash
npm ci
```

### Start the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200), then choose the customer or internal application path:

```text
http://localhost:4200/ElectroCustomer
http://localhost:4200/ElectroInternal
```

### Build for production

```bash
npm run build
```

### Run unit tests

```bash
npm test
```

## Configuration

Development API URLs and the Google client ID are defined in `src/environments/environment.dev.ts`. Keep environment-specific values out of source control when adapting the application for another deployment.

## Backend companion

This application depends on [HadakaElectroBackend](https://github.com/ahmed-hadaka/HadakaElectroBackend), a Spring Boot multi-module backend with dedicated customer and internal APIs plus shared domain code.

## Why this repository stands out

This is not only a generated Angular shell: it demonstrates a complete client architecture around a real commerce domain, including two user journeys, guarded permissions, stateful workflows, protected API calls, and analytics-ready operations screens.

## License

This project is maintained as a portfolio and learning project by [Ahmed Hadaka](https://github.com/ahmed-hadaka).
