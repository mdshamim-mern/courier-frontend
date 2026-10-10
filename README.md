# Dropzo — Courier & Logistics Platform

A bilingual, role-based courier application built for the B7A7 full-stack assignment, extended with approved coverage, server-calculated tariffs, pickup allocation, delivery evidence and COD accounting.

## Project links

| Resource | URL |
| --- | --- |
| Live frontend | https://courier-frontend-sigma.vercel.app |
| Live backend | https://courier-logistics-backend-lake.vercel.app |
| Public API documentation | https://courier-logistics-backend-lake.vercel.app/docs |
| Frontend repository | https://github.com/mdshamim-mern/courier-frontend |
| Backend repository | https://github.com/mdshamim-mern/courier-logistics-backend |
| Postman collection | https://courier-logistics-backend-lake.vercel.app/docs/postman/collection |
| Postman environment | https://courier-logistics-backend-lake.vercel.app/docs/postman/environment |

Demo video: recording and a shareable link are still required. See [recording guide](docs/demo-recording.bn.md). No fabricated video URL is supplied.

## Evaluation accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@courier.com | Admin@12345 |
| Customer | customer@courier.com | Customer@1234 |
| Delivery worker | courier@courier.com | Courier@1234 |

These are public evaluation accounts, not personal credentials. Login provides one-click role entry when demo access is enabled. Never store private information in these shared accounts. Production operators should disable demo entry and retire shared credentials.

## Capabilities

- English/Bangla pages with a responsive purple glass interface, accessible navigation and isolated role dashboards.
- Email/password, verification, recovery and configured Google authentication.
- Backend-verified session and role checks before protected page delivery, plus API authorization on every protected operation.
- Three-step parcel booking: addresses → product/service → approved quote and confirmation. Unsupported routes are blocked; hub allocation is not a customer requirement.
- TanStack Form and Zod validation, actionable server errors, loading skeletons, retry states and URL-backed list searches/pagination.
- Customer shipment history, receipt/label, payment history, merchant application and COD ledger.
- Courier pickup/delivery tasks, permitted state transitions, failure reasons and recipient acknowledgment/evidence.
- Administrator user management, functional worker details/editing, guarded hub changes, route settings, approvals and parcel assignment.
- Database-backed dashboard totals, status distribution and six-month paid delivery-fee revenue charts.
- Unique public-page metadata, language alternates and generated OpenGraph artwork.

## Architecture

Next.js App Router → same-origin /api/backend rewrite → Express API → PostgreSQL/Prisma + Redis.

Next.js Proxy checks sessions with the backend. The API validates current account status/role, session revocation, payloads and parcel transitions. Browser redirects never establish payment success.

Technology: Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query/Form, Zod, next-intl, Base UI, Playwright and Biome.

## Local setup

Use Node.js 22–26 and npm. Run the backend first.

```bash
npm ci
```

Copy .env.example to .env.local and configure API_BASE_URL, NEXT_PUBLIC_FRONTEND_URL and optional Google client ID. API_BASE_URL must point to the backend /api/v1, not the frontend rewrite. Never expose database, JWT, Stripe or bKash secrets through NEXT_PUBLIC variables.

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm start
```

For the browser regression suite, build first, then run npm run test:e2e. Tests use a loopback-only session fixture and intercepted business API responses; they do not validate live provider settlement. Production builds contain no test-auth bypass.

## Payment and operations boundaries

Stripe test mode and bKash sandbox are evaluation integrations; use no real money. Server/provider verification is required before PAID. Provider minimum amounts may reject otherwise valid low-value quotes; never change approved pricing merely to bypass a provider rule.

COD is product money collected from the receiver, separate from delivery-fee payment. Merchant approval is required. Remittances happen outside the app; administrators record completed transfers and references. Automatic withdrawals, paid refunds, timed data purges and guaranteed payouts are not implemented.

Coverage and tariffs are stored in the database and editable by administrators. Retained evaluation records can appear in statistics. Legal pages distinguish operational behavior from proposed launch policies and make no verified registration claim.

## Verification and submission

- Automated checks: type checking, linting, production build and browser regression tests.
- Backend checks and migrations are documented in its README.
- [Assignment audit](docs/assignment-audit.bn.md) records the earlier gaps; it is not a guarantee of marks.
- [Recording checklist and script](docs/demo-recording.bn.md) covers a 5–10 minute role-based demo.
- Submission requires both repository links, both live links, public API documentation, demo credentials and a real shareable video link.

Pushes to main run configured GitHub checks and trigger the connected Vercel projects. Verify the deployed commit and live health before submission.

Developed by [Md Shamim](https://github.com/mdshamim-mern).
