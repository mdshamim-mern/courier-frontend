# Courier assignment requirement audit — ১০ অক্টোবর ২০২৬

> এটি পরিবর্তন বাস্তবায়নের আগের audit। নিচের ঘাটতির তালিকা বর্তমান release-এর অবস্থা নয়। পরবর্তী পরিবর্তনে one-click demo login, backend-verified route protection, TanStack Form/Zod validation, URL-backed filters, skeleton/error states, database-backed charts, booking wizard, public metadata এবং README/API documentation যোগ করা হয়েছে। প্রকাশের আগে regression পরীক্ষা ও deployment যাচাই করতে হবে। নতুন live booking থেকে provider-paid browser proof এবং বাস্তব shareable demo video এখনও আলাদাভাবে সম্পন্ন করতে হবে; automated mock tests এগুলোর বিকল্প নয়।

## সিদ্ধান্ত

দেওয়া B7A7 assignment ও Project Requirements অনুযায়ী এখনো সব শর্ত পূরণ হয়নি। উন্নত courier workflow ও responsive design আছে, কিন্তু কয়েকটি mandatory frontend requirement বাকি। ১০৮টি regression test পাস করা requirement compliance-এর সার্টিফিকেট নয়; বর্তমান পরীক্ষাগুলো সব rubric item পরীক্ষা করে না। পূর্ণ নম্বরের নিশ্চয়তা দেওয়া যায় না।

দেওয়া Idea Hub-এর courier features সম্ভাব্য ধারণা, fixed grading checklist নয়। B7A6-এর পৃথক mandatory grading sheet এই তিনটি attachment-এর মধ্যে নেই।

## যা আছে

- Next.js App Router, TypeScript strict mode, Server layout/public components এবং interactive Client components।
- Tailwind + shadcn-style Base UI components, purple glass design, বাংলা/ইংরেজি এবং tested mobile/tablet/desktop layouts।
- CUSTOMER, COURIER, ADMIN—তিন role-এর পৃথক UI, client AuthGuard/RoleGuard এবং real backend authorization।
- Real API, TanStack Query caching/invalidation এবং shared providers/Sidebar Context; core production flow mock JSON থেকে চলে না। Test fixture DB records আলাদা চিহ্নিত।
- Login/Register/Reset/Forgot forms-এ TanStack Form + Zod; booking-এ Zod আছে কিন্তু form library নেই।
- Stripe checkout, callback/webhook verification, reconciliation ও success/cancel/failure pages আছে। COD এই payment-এর বিকল্প নয়।
- ৪৪টি page.tsx route আছে—সর্বনিম্ন ১৮টির সংখ্যা অতিক্রম করেছে; কিছু shipment detail route shared component ব্যবহার করে।
- Custom error.tsx/not-found.tsx, কিছু skeleton এবং কিছু Base UI toast আছে।
- Frontend Git history-তে ৪১টি commit আছে; ২০টির সংখ্যাগত শর্ত পূরণ।
- দুই real repo, live frontend/backend এবং শেষ release-এর সফল CI/deployment আছে।
- Courier booking, coverage/approved quote, assignment/handover, failure/return, acknowledgment proof, COD ledger, merchant review, CSV bulk booking ও print labels আছে।

## আগে ঠিক করতে হবে

১. **One-click Demo Login:** live login-এ দেখানো হয় না। source-এর NEXT_PUBLIC_ENABLE_DEMO_LOGIN gate বন্ধ; চালু করলেও button শুধু email/password পূরণ করে, login submit করে না। তিনটি button এক ক্লিকে authenticate করে সঠিক role dashboard-এ যেতে হবে।
প্রমাণ: src/components/form/login-form.tsx। Live HTML-এ One-Click Demo Login নেই।

২. **Route-level auth:** src/proxy.ts শুধু next-intl locale routing করে। Backend authorization ও client RoleGuard থাকলেও protected frontend route-এ server/proxy-level session/role enforcement নেই। Rubric-এর middleware/route-level অংশ পূর্ণ নয়; এটি private backend API bypass হয়েছে—এমন দাবি নয়।

৩. **সব form নির্ধারিত library + schema:** booking-এ useState + BookingSchema, admin hubs/couriers ও settings/review/settlement-এ native FormData/HTML validation আছে। অনেক profile/application/quote/tracking form-ও TanStack Form/RHF ব্যবহার করে না। এগুলো library ও backend-matching schema-তে রূপান্তর এবং field-level error দরকার।
প্রমাণ: create-shipment-form.tsx, admin/hubs/page.tsx, admin/manage-couriers/page.tsx, operations/admin-settings.tsx, operations/profile-forms.tsx।

৪. **URL state:** Hubs/Couriers/Users/Audit/Shipments/Payment History/WorkBoard-এর search/filter/page মূলত useState; URL query নয়। সব search/filter/sort/page URL-এ sync এবং reload/back/bookmark-এ retain করতে হবে। Backend query support থাকা মানে frontend requirement পূরণ নয়।

৫. **Skeleton ও loading coverage:** dashboard loading skeleton আছে; admin/courier loading full-screen Spinner। Shipment history/detail/profile এবং coverage/settings/workboard-এও সব জায়গায় skeleton নেই। সব API page-এর initial/refetch loading যথাযথ করতে হবে।

৬. **সব API error-এর feedback:** Base UI toast এবং inline feedback কিছু জায়গায় আছে, কিন্তু uniform নয়। Payment History শুধু data/isLoading নেয়; API failure-এ empty list দেখাতে পারে। Toast + retry/error state দিতে হবে; existing error.tsx রাখা যাবে। নির্দিষ্ট library নামের বদলে equivalent Base UI toast গ্রহণ হবে কি না evaluator-এর সিদ্ধান্ত।

৭. **Admin charts:** overview-এ real total cards ও shortcuts আছে, chart নেই। Real API data দিয়ে shipment-status/revenue analytics chart দরকার। Recharts বাধ্যতামূলক library নয়, কিন্তু chart-based overview guideline আছে।

৮. **Multi-step workflow:** বর্তমান booking দীর্ঘ এক-পৃষ্ঠার form; stepper/wizard নয়। Pickup/Recipient -> Product/Service -> Quote/Review -> Confirm-এর মতো অন্তত একটি multi-step form দরকার।

৯. **Metadata/SEO:** root generic title/description আছে, কিছু public page-এর নিজস্ব metadata আছে। Home/Contact/Pricing/Coverage/Business/Application-এর সব public page-এ unique metadata/Open Graph সম্পূর্ণ নয়।

১০. **No-placeholder ও submission polish:** Terms/Privacy/Cookies-এ স্পষ্ট draft এবং [Data Inventory...]/[Retention Schedule...] ধরনের অপূর্ণ তথ্য আছে। প্রকৃত তথ্য ও প্রয়োজনীয় review ছাড়া draft সতর্কতা লুকিয়ে final দাবি করা যাবে না। Frontend README এখনও bun init boilerplate, backend README নতুন Operations/Stripe/cookie auth-এর সঙ্গে পুরোপুরি মেলে না। কিছু empty state-ও icon/illustration ছাড়া plain text।

১১. **Payment-এর fresh UI proof:** actual Stripe provider-paid test-এর পুরোনো নথি আছে। নতুন merchant/customer booking -> checkout -> provider verification -> success/cancel -> payment history-এর browser demonstration এবং dashboard update এখনও সম্পূর্ণ দেখানো হয়নি। ৬০ টাকার route quote Stripe minimum-এর নিচে হলে তা ঠিকভাবে reject হয়; শুধু test পাশ করাতে fee/weight বানানো যাবে না।

১২. **Video ও published API docs:** ৫–১০ মিনিটের Demo Video link দেওয়া হয়নি। /docs এবং /api/v1/docs 404। README-তে উল্লিখিত পুরোনো collection file বর্তমান repo-তে নেই। নতুন files নিচে আছে, কিন্তু এগুলোর নতুন public/share link প্রকাশ বাকি।

## অতিরিক্ত উন্নতি, mandatory blocker নয়

- Profile avatar upload API আছে কিন্তু frontend upload/progress/preview workflow নেই; domain/evaluator প্রত্যাশা অনুযায়ী যোগ করা যায়।
- next/image আছে, কিন্তু explicit lazy loading ও URL-state performance demonstration আরও ভালো করা যায়।
- Courier earnings configured commission ও delivered records থেকে আসে; unconfigured compensation-কে বানানো income দিয়ে পূরণ করা যাবে না।
- Idea Hub-এর multi-organization বা background jobs সব যোগ করা আবশ্যক নয়। আগে উপরোক্ত assignment gap পূরণ।

## Verified dedicated demo credentials

Live API-তে login -> GET /users/me -> logout: প্রত্যেক role-এ ২০০; কোনো parcel/account/role/payment বদলানো হয়নি।

| Role | Email | Password |
|---|---|---|
| Admin | admin@courier.com | Admin@12345 |
| Customer | customer@courier.com | Customer@1234 |
| Courier | courier@courier.com | Courier@1234 |

এগুলো আগেই README-তে প্রকাশিত evaluation account, ব্যক্তিগত password নয়। প্রকৃত টাকা/ব্যক্তিগত তথ্যযুক্ত production-এ public admin demo account রাখা যাবে না; coursework evaluation ও commercial production আলাদা রাখুন।

## Submission তথ্য

- Project Name: Courier & Logistics Platform (Dropzo)
- Backend Repo: https://github.com/mdshamim-mern/courier-logistics-backend
- Frontend Repo: https://github.com/mdshamim-mern/courier-frontend
- Live Backend URL: https://courier-logistics-backend-lake.vercel.app
- Live Frontend URL: https://courier-frontend-sigma.vercel.app
- API base: https://courier-logistics-backend-lake.vercel.app/api/v1
- Current README link: https://github.com/mdshamim-mern/courier-logistics-backend/blob/main/README.md (পুরোনো API তালিকা; নতুন docs-এর replacement নয়)
- Updated API Documentation public/share link: প্রকাশ বাকি।
- Demo Video: ৫–১০ মিনিট recording + shareable link বাকি।
- Demo Admin Email/Password: উপরের verified account।

দেওয়া assignment অনুযায়ী deadline: ১০ অক্টোবর ২০২৬ রাত ১১:৫৯। নিজের Programming Hero submission page-এ final deadline/সময় নিশ্চিত করুন। Late submission গ্রহণের দাবি ফাইলে নেই।

## নতুন API documentation

Backend folder-এ:
- Courier-Logistics-Updated.postman_collection.json — ৬৭টি request example; ৬১ unique endpoint, health-সহ।
- Courier-Logistics-Live.postman_environment.json — live base URL, password/token blank, mutations ও provider callback default বন্ধ।
- docs/api-reference.md — cookie/CSRF, full endpoint inventory, quote-version booking, workflow/proof, review/COD settlement, Stripe/bKash ও safety instructions।

Postman-এ দুটো JSON Import করে নতুন Live environment বেছে role password locally বসান। Login করলে cookie নিজে থাকে; JSON থেকে accessToken কপি করার পুরোনো নির্দেশনা ব্যবহার করবেন না। অন্য role-এর আগে Logout। অনুমতি ছাড়া allow_mutations/allow_provider_callbacks true করবেন না, write-enabled collection Run All করবেন না।

এই turn-এ app implementation বা নতুন deployment বদলানো হয়নি। শুধু audit ও চাওয়া documentation artifacts তৈরি হয়েছে; নতুন files commit/push করা হয়নি।
