# Admin management: ব্যবহারযোগ্যতা ও যাচাই

## নকশা

মূল Dropzo layout, purple brand, navigation, role guard এবং API endpoint রাখা হয়েছে। Overview, Users, Couriers, Hubs, Operations, Shipments ও Audit পাতায় scoped glassy banner, card, feedback এবং refresh control যোগ হয়েছে। ছোট পর্দায় টেবিলের প্রতিটি রেকর্ড label-সহ card হয়; দীর্ঘ নাম, ইমেইল ও ঠিকানা ভাঙে, তথ্য বাদ যায় না।

## কাজের বোতাম

- Hubs: View নতুন server detail পড়ে। Add ও Edit আসল POST/PATCH endpoint ব্যবহার করে। Delete আগে সম্মতি নেয় এবং server অনুমতি দিলেই soft archive করে। ব্যবহৃত হাব, পার্সেল বা ইতিহাসের সংযোগ থাকলে কারণসহ 409 দেখায়; ডেটা মুছে না।
- Couriers: View profile ও কাজের ইতিহাস পড়ে। Edit যানবাহন, উপস্থিতি ও হাব আপডেট করে। Add প্রশাসকের যাচাইকৃত নতুন কর্মী তৈরির API ব্যবহার করে; public আবেদনের পথ আলাদা। চলমান পার্সেল থাকলে হাব পরিবর্তন server আটকায়।
- Users: View পূর্ণ পরিচয় দেখায়। Role এবং Block/Unblock আগে স্পষ্ট সম্মতি চায়। শেষ সক্রিয় প্রশাসক ও কর্মীর কাজ বরাদ্দের server guard অপরিবর্তিত।
- Operations: Edit area/rate পূরণ করা form-এ নিয়ে যায়। Save সফল হলে feedback থাকে এবং server data আবার পড়ে। Worker/business review এবং manual cash receipt/payout reference-এর বিদ্যমান API রাখা হয়েছে।
- Shipments: বিদ্যমান assignment, handover এবং details/printable label-এর কাজ রাখা হয়েছে।
- Audit: View পূর্ণ raw event detail দেখায়; audit record সম্পাদনা বা মুছার বোতাম নেই।

## দীর্ঘ প্রথম রেকর্ড ও সংখ্যার উৎস

`Checkout Verification`, `@integration.test`, পরিচিত demo courier এবং checkout fixture tracking record পরীক্ষামূলক চিহ্ন পায়। এগুলো ডেটাবেসের সংরক্ষিত রেকর্ড, UI-এর বানানো গ্রাহক নয়। নাম বা ইমেইল বদলানো, রেকর্ড লুকানো বা মুছে দেওয়া হয়নি। Overview-এর সংখ্যা এখনও server API থেকে আসে এবং সংরক্ষিত test record-ও অন্তর্ভুক্ত করে। Revenue হল PAID delivery-fee payment, ব্যবসায়ীর COD টাকা নয়।

## পরীক্ষা

- Frontend production build ও TypeScript সফল। Lint-এ নতুন error নেই; sidebar-এর আগে থাকা document.cookie warning রয়ে গেছে।
- সম্পূর্ণ browser regression suite: ১০৮টি সফল। Admin-এর ১৪টি পরীক্ষা real endpoint contract-এর mock দিয়ে View/Edit/Add/Delete confirmation, conflict feedback, account blocking, area edit এবং দুই ভাষায় ৩৬০/৭৬৮/১৩৬৬ পিক্সেলের layout যাচাই করে।
- Desktop ও বাংলা mobile screenshot দেখে layout যাচাই হয়েছে।
- Backend production build, TypeScript, lint এবং ৫৭টি unit test সফল। নতুন ১১টি test হাবের সংযোগ, soft archive, duplicate name, field validation, ভুল হাব এবং চলমান কর্মীর কাজের guard যাচাই করে।
- এই পরিবর্তনে database schema বদলায়নি; নতুন migration নেই।

## প্রকাশ্য পরীক্ষার সীমা

পরীক্ষায় বিদ্যমান live গ্রাহক, কর্মী, হাব বা পার্সেল মুছে ফেলা বা অনুমতি বাড়ানো হয়নি। Authenticated live CRUD যাচাইয়ের জন্য ব্যবহারকারীর admin login দরকার; local API-contract পরীক্ষা live data পরিবর্তনের প্রমাণ নয়। GitHub push-এর পরে Vercel deployment status ও প্রকাশ্য HTTP response আলাদাভাবে যাচাই করতে হবে।

Bob Merly booking ও Stripe test/bKash sandbox payment আলাদা অসম্পন্ন কাজ: ব্যবহারকারী নিজে business approval এবং merchant login দেবেন। এই release-এ বাস্তব টাকা কাটা, কৃত্রিম PAID লেখা বা ব্যবসায়ীর টাকা স্বয়ংক্রিয়ভাবে পাঠানো হয়নি।
