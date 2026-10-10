# 📦 Dropzo — Courier & Logistics Platform (Frontend)

A bilingual courier workspace for Customers, Delivery Workers and Administrators. Book parcels, review approved costs, follow shipment updates and manage logistics through a responsive purple-glass interface.

![Next.js](https://img.shields.io/badge/Next.js-16-171717?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19-149eca?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178c6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)

[Live App](https://courier-frontend-sigma.vercel.app) · [Backend Source](https://github.com/mdshamim-mern/courier-logistics-backend) · [Postman API Docs](https://documenter.getpostman.com/view/56161283/2sBYHQ2hrg) · [API Reference](https://courier-logistics-backend-lake.vercel.app/docs) · [Report a Bug](https://github.com/mdshamim-mern/courier-frontend/issues)

## 📖 Overview

Dropzo is the frontend of a full-stack courier platform developed for the B7A7 assignment and extended with coverage validation, pickup allocation, recipient acknowledgment and separate COD accounting. This repository contains the Next.js application. Persistent data, authorization, tariff calculations and payment verification belong to the separate Express/PostgreSQL backend.

| Resource | Public link |
| --- | --- |
| Live frontend | [courier-frontend-sigma.vercel.app](https://courier-frontend-sigma.vercel.app) |
| Live backend | [courier-logistics-backend-lake.vercel.app](https://courier-logistics-backend-lake.vercel.app) |
| Frontend repository | [mdshamim-mern/courier-frontend](https://github.com/mdshamim-mern/courier-frontend) |
| Backend repository | [mdshamim-mern/courier-logistics-backend](https://github.com/mdshamim-mern/courier-logistics-backend) |
| Current API documentation | [Endpoint reference and examples](https://courier-logistics-backend-lake.vercel.app/docs) |
| Published Postman documentation | [Complete Dropzo API documentation](https://documenter.getpostman.com/view/56161283/2sBYHQ2hrg) |
| Postman collection | [Download updated collection](https://courier-logistics-backend-lake.vercel.app/docs/postman/collection) |
| Postman environment | [Download safe evaluation environment](https://courier-logistics-backend-lake.vercel.app/docs/postman/environment) |
| Earlier Postman publication | [Original backend documentation](https://documenter.getpostman.com/view/56161283/2sBYB1P8Wz) |

The earlier Postman publication is preserved as historical documentation. The new Postman publication and updated collection contain the current endpoint inventory. A real shareable demo video is still required; the [Bangla recording script](docs/demo-recording.bn.md) is not a video substitute.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Routes and Structure](#-routes-and-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Authentication](#-authentication)
- [API Integration and Postman](#-api-integration-and-postman)
- [Booking and Payments](#-booking-and-payments)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Assignment Submission](#-assignment-submission)
- [Operational Boundaries](#-operational-boundaries)
- [Author](#-author)

## ✨ Features

### Public experience

- English/Bangla interfaces with localized coverage labels, navigation and metadata.
- Responsive purple-glass layouts, mobile navigation, keyboard focus and loading/error feedback.
- Direct booking entry with an authenticated return path.
- Tracking-number lookup showing recorded status and timestamps.
- Database-backed service coverage and server-calculated delivery estimates.
- Merchant registration, worker applications and staff entry.
- About, contact, services, FAQ, terms, privacy and cookie pages.

### Customer workspace

- Three-step booking: addresses → product/service → reviewed quote and confirmation.
- Pickup/delivery areas, supported home collection or branch drop-off, product type, weight, declared value, COD and collection time.
- Automatic hub resolution, itemized charges, stale-quote protection and idempotent retries.
- Shipment history, details/timeline, printable receipt and QR parcel label.
- CSV bulk-booking preparation with row validation and per-parcel quotes.
- Stripe test checkout, bKash sandbox, reconciliation and payment history.
- Merchant application, payout-account review, product-cash ledger and profile editing.

### Delivery-worker workspace

- Scoped pickup/delivery tasks, task filters and shipment details.
- Server-permitted transitions, hub arrivals, failure reasons and recipient-drawn signature acknowledgment.
- Product COD collections and recorded handovers, separate from worker compensation.
- Earnings/history, completed deliveries and performance summaries.
- Profile and availability controls.
- Refresh actions with pending, success and retry feedback requesting fresh API data.

### Administrator workspace

- Database-backed totals, status distribution and six-month paid delivery-fee revenue charts.
- Searchable users, role/status controls and worker detail/edit dialogs.
- Hub creation, editing and guarded soft archiving.
- Service areas, approved tariffs, merchant reviews and worker application reviews.
- Pickup assignment and destination-hub handoff with availability/workload checks.
- Shipment details, evidence, cash records and audit logs.

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Base UI, class-variance-authority, tw-animate-css |
| Icons | Lucide React |
| Server state | TanStack Query |
| Forms and validation | TanStack Form, Zod |
| HTTP client | ofetch through a same-origin rewrite |
| Localization | next-intl, English/Bangla messages |
| Authentication | Backend-issued HttpOnly sessions, optional Google sign-in |
| Parcel utilities | PapaParse, QRCode, date-fns |
| Payments | Backend-created Stripe checkout / bKash sandbox |
| Quality | Playwright, TypeScript, Biome |
| Deployment | Vercel, GitHub Actions |
| Separate backend | Express, Prisma, PostgreSQL, Redis |

## 📁 Routes and Structure

Pages use `/en` or `/bn` prefixes. Except the home entry, paths below are relative to that prefix; API paths are not localized.

| Area | Routes |
| --- | --- |
| Public | `/[locale]`, `/coverage`, `/pricing`, `/track-shipment`, `/services`, `/about`, `/contact`, `/faq` |
| Authentication | `/login`, `/register`, `/verify-account`, `/forgot-password`, `/reset-password` |
| Applications | `/merchant-register`, `/courier-apply` |
| Customer | `/dashboard`, `/dashboard/new-shipment`, `/dashboard/my-shipments`, `/dashboard/my-shipments/[id]`, `/dashboard/payments`, `/dashboard/business`, `/dashboard/collections`, `/dashboard/bulk`, `/dashboard/profile` |
| Worker | `/courier`, `/courier/deliveries`, `/courier/shipments/[id]`, `/courier/collections`, `/courier/earnings`, `/courier/profile` |
| Admin | `/admin`, `/admin/manage-users`, `/admin/manage-couriers`, `/admin/hubs`, `/admin/operations`, `/admin/all-shipments`, `/admin/shipments/[id]`, `/admin/audit-logs` |
| Payment results | `/payment/success`, `/payment/cancel`, `/payment/failure` |
| Policies | `/terms`, `/privacy`, `/cookies` |

```text
src/
├── app/[locale]/
│   ├── (auth)/
│   ├── dashboard/
│   ├── courier/
│   ├── admin/
│   ├── payment/
│   └── public and policy pages
├── api/
├── components/
│   ├── modules/admin/
│   ├── modules/courier/
│   ├── modules/dashboard/
│   ├── operations/
│   ├── form/
│   └── ui/
├── hooks/
├── lib/
├── types/
├── validation/
├── i18n.ts
└── proxy.ts
messages/
e2e/
docs/
```

## 🚀 Getting Started

Prerequisites: Node.js **22–26**, npm and a reachable backend. This frontend does not run database migrations.

```bash
git clone https://github.com/mdshamim-mern/courier-frontend.git
cd courier-frontend
npm ci
```

Copy `.env.example` to `.env.local`, fill the configuration below and start:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Start the backend at port 5000 for local authenticated flows.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run typecheck` | Generate route types and check TypeScript |
| `npm run lint` | Biome lint checks |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run test:e2e` | Playwright suite; build first |
| `npm run audit:security` | Dependency audit |

## 🔑 Environment Variables

```env
API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_ENABLE_DEMO_LOGIN=false
```

| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Backend origin plus `/api/v1`, configured server-side |
| `NEXT_PUBLIC_FRONTEND_URL` | Public frontend origin |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional public Google OAuth client ID |
| `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` | One-click evaluation entry only |

For production, `API_BASE_URL=https://courier-logistics-backend-lake.vercel.app/api/v1`. Avoid a trailing slash. Browser calls use `/api/backend`. Database credentials, JWT secrets, Stripe secret keys and bKash credentials must never use `NEXT_PUBLIC_*`. Hosted checkout requires no frontend Stripe secret.

## 🔐 Authentication

Login sets HttpOnly access/refresh cookies. Tokens are not extracted from login JSON or persisted in localStorage. Next.js Proxy checks the session with the backend before protected page delivery and routes each role to its workspace. The API separately verifies account status, role, ownership and session revocation.

Requests use the same-origin rewrite, cookies and `X-Courier-Client: 1`. Refresh reads the refresh cookie; logout revokes the session and clears cookies. UI role checks do not replace server authorization.

### Evaluation accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@courier.com` | `Admin@12345` |
| Customer | `customer@courier.com` | `Customer@1234` |
| Courier | `courier@courier.com` | `Courier@1234` |

These are public shared evaluation accounts, not personal credentials. Do not store private information in them. Disable demo entry and retire shared credentials before commercial launch.

## 🔌 API Integration and Postman

```text
Next.js → /api/backend rewrite → Express /api/v1 → Prisma/PostgreSQL + Redis
```

[Current API documentation](https://courier-logistics-backend-lake.vercel.app/docs) covers **58 versioned endpoints plus three root/health endpoints**, organized into **67 Postman request examples**, with request bodies, response examples, workflow rules and testing boundaries.

The same collection is available as [public Postman documentation](https://documenter.getpostman.com/view/56161283/2sBYHQ2hrg), with **131 sanitized illustrative response examples**. No private environment values are published; import the safe evaluation environment separately.

| Workflow | API paths relative to `/api/v1` |
| --- | --- |
| Session/profile | `/auth/*`, `/users/me`, `/users/profile-image` |
| Coverage/estimates | `/operations/coverage`, `/operations/quote`, `/operations/quotes` |
| Booking/labels | `/shipments`, `/shipments/bulk`, `/shipments/:id`, `/shipments/summary` |
| Public tracking | `/shipments/track/:trackingId` |
| Merchant/application/COD | `/operations/business`, `/operations/applications`, `/operations/mine` |
| Worker/earnings | `/couriers/:id`, `/couriers/:id/history-earnings` |
| Assignment/handoff/events | `/shipments/:id/assign`, `/shipments/:id/handoff`, `/shipments/:id/status` |
| Checkout/history | `/payments/stripe/initiate`, `/payments/initiate`, `/payments/reconcile`, `/payments` |
| Administration | `/admin/*`, `/hubs`, `/couriers`, `/operations/admin`, configuration/review routes, `/audit-logs` |

1. Import the [collection](https://courier-logistics-backend-lake.vercel.app/docs/postman/collection) and [environment](https://courier-logistics-backend-lake.vercel.app/docs/postman/environment).
2. Select **Dropzo Live - Evaluation (writes disabled)** and fill an authorized account's password locally.
3. Enable the cookie jar, send the matching role login, then `GET /users/me`.
4. Keep mutation/provider-callback flags disabled for inspection. Enable only an individually authorized operation; do not run the whole collection with writes enabled.
5. Log out before switching roles. Never publish passwords, cookies, OTPs or provider secrets.

Examples are illustrative contracts, not fabricated live transactions. The old backend README is preserved by request; use current docs for cookie authentication and newly added endpoints.

## 📦 Booking and Payments

The server resolves supported areas and approved tariffs. Customers review the effective service, base fee, extra weight, pickup fee and separate COD fee before confirmation. A request UUID supports identical retries; changed/stale quotes require a new review.

```text
PENDING → ASSIGNED → PICKED_UP → AT_ORIGIN_HUB → IN_TRANSIT
        → AT_DESTINATION_HUB → OUT_FOR_DELIVERY → DELIVERED
```

Failure, return and cancellation paths are validated separately. Tracking is recorded history, not live GPS. Delivery evidence records acknowledgment, not OTP identity verification.

Stripe test mode and bKash sandbox pay the **delivery fee**. The backend accepts a shipment ID, derives its amount and creates hosted checkout. Provider verification, signed webhooks or reconciliation—not a success-page redirect—establish payment status. Approved prices must not be changed merely to bypass a provider minimum.

**COD is product money collected from the receiver**, separate from delivery-fee payment and worker earnings. Merchant approval is required. Cash receipt and merchant-remittance actions record transfers already completed outside the app; they do not send money.

## ✅ Testing

- Type checking, Biome linting, production builds and Playwright regressions are part of verification.
- The latest pre-documentation frontend release passed **134 browser tests**: [GitHub Actions run](https://github.com/mdshamim-mern/courier-frontend/actions/runs/38058462505).
- Browser tests use a loopback-only session fixture and intercepted business responses, not live provider settlement. Production builds contain no test-auth bypass.
- Backend security/workflow tests are separate. API docs distinguish source coverage, mocked tests, live read checks and provider verification.
- A fresh customer-browser booking → eligible Stripe test checkout → verified status walkthrough should be recorded for submission; historical smoke results are not a substitute.

The [assignment audit](docs/assignment-audit.bn.md) is a historical gap report, not a guarantee of marks or the current test count.

## 📦 Deployment

Vercel hosts the frontend. Pushes to `main` trigger connected deployments and GitHub checks. Configure frontend environment variables, the backend's permitted origin and intended provider redirects/webhooks.

Before submission verify the deployed commit, successful checks, API readiness, three-role logins, both languages, booking quotes and an eligible test checkout. Never expose provider secrets in frontend configuration.

## 📋 Assignment Submission

```text
Project Name        : Courier & Logistics Platform (Dropzo)
Backend Repo        : https://github.com/mdshamim-mern/courier-logistics-backend
Frontend Repo       : https://github.com/mdshamim-mern/courier-frontend
Live Backend URL    : https://courier-logistics-backend-lake.vercel.app
Live Frontend URL   : https://courier-frontend-sigma.vercel.app
API Documentation   : https://documenter.getpostman.com/view/56161283/2sBYHQ2hrg
API Reference       : https://courier-logistics-backend-lake.vercel.app/docs
Demo Video          : PENDING — add your real shareable 5–10 minute recording
Demo Admin Email    : admin@courier.com
Demo Admin Password : Admin@12345
```

The [recording guide](docs/demo-recording.bn.md) covers public pages, authorization, booking, Stripe test payment, worker tasks and administration. Do not submit a placeholder video URL. Submit the new Postman-hosted link above; the earlier publication lacks the latest APIs.

## ⚠️ Operational Boundaries

- Database-backed coverage/tariffs do not establish commercial service capacity.
- Retained test/demo records can affect dashboard statistics.
- Automatic merchant payouts, paid refunds and scheduled data purges are not implemented.
- Legal pages distinguish implemented behavior from proposed policies, without a verified registration claim.
- Test payment verification does not prove physical collection/delivery or real-money transfer.

## 👤 Author

[Md Shamim](https://github.com/mdshamim-mern) · [Frontend source](https://github.com/mdshamim-mern/courier-frontend) · [Backend source](https://github.com/mdshamim-mern/courier-logistics-backend)

© 2026 Dropzo. Built by Md Shamim.
