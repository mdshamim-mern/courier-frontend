# Project transformation

- Home has ten meaningful sections: hero, tracking, coverage statistics, estimate, delivery process, service selection, business benefits, FAQs, parcel preparation and team applications.
- Fictional testimonials have been removed. Service information describes actual workflows and availability limits.
- English/Bengali switching remains available alongside a persistent light/dark preference.
- Coverage supports search, district/pickup/delivery filters, name sorting, eight results per page, and public area details. Services have public details and related services.
- Customer shipment/payment lists support server-side filtering and pagination. Collections and worker delivery history support filtering and paging of their returned records. Collection totals remain totals, not filtered subtotals; the API's existing 200-record retention window is disclosed.
- Dashboard account menus link to role-specific editable profiles and logout.
- Footer includes the owner's supplied social and messaging links.

## Gemini configuration

Set `GEMINI_API_KEY` in the **frontend** server environment (Vercel Production and Preview), then redeploy. Never use a `NEXT_PUBLIC_` prefix. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; set it to a model available to the configured Google project if needed. See Google's [current model documentation](https://ai.google.dev/gemini-api/docs/models) and [REST API reference](https://ai.google.dev/api/generate-content).

Two distinct features use Gemini: `/en/assistant` (or `/bn/assistant`) answers courier support questions; customer/admin overviews generate delivery insights from current authorized aggregate shipment status counts. Both require a signed-in account. The backend `/api/v1/ai/context` enforces a shared Redis quota of 15 requests per user per hour and actor-scoped aggregation. No individual recipient records are sent to Gemini. Questions are sent to Google only on explicit submission.

The AI route validates input/origin, limits output, applies provider timeouts, returns generic provider errors and never changes bookings or payments. Missing configuration returns an explicit unavailable state. It does not fabricate answers or claim a live provider test passed.

## Verification

Run frontend typecheck/lint/build and Playwright. Build the browser-test bundle with `API_BASE_URL=http://127.0.0.1:5101/api/v1` and `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=true`. The transformation suite covers combined filtering, detail links, theme persistence, language switching, mobile sizing and AI request rejection. Backend tests cover payment ownership/filtering and AI quota/scope/privacy.
