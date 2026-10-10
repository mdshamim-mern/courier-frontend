# Dropzo demo — recording checklist ও script

নিজের রেকর্ড করা ৫–১০ মিনিটের ভিডিও জমা দিন। এটি ভিডিও নয়; কোনো বানানো share link দেওয়া হয়নি।

## প্রস্তুতি

- frontend ও backend live health খুলে দেখুন; সঠিক deployment commit নিশ্চিত করুন।
- তিন role-এর demo account ব্যবহার করুন; ব্যক্তিগত তথ্য, session cookie বা server secret দেখাবেন না।
- অনুমোদিত এলাকা/মূল্য ও test record ব্যবহার করুন। বাস্তব টাকা বা বাস্তব ডেলিভারি নয়।
- Stripe test-mode বা bKash sandbox label দেখান; provider credentials গোপন রাখুন।
- সফলতার পাশাপাশি একটি validation ও একটি actionable error দেখান।

## ৭–৯ মিনিটের script

1. ০:০০–০:৪৫ — “এটি Dropzo Courier & Logistics Platform। Next.js frontend, Express API, PostgreSQL ও Redis ব্যবহার করেছি।” বাংলা/ইংরেজি, mobile layout ও প্রধান navigation দেখান।
2. ০:৪৫–১:৩০ — coverage ও approved pricing দেখান। “এলাকা ও দাম database থেকে আসে; unsupported route বুক করা যায় না।”
3. ১:৩০–৩:০০ — one-click customer login; তিন ধাপে addresses, product/service ও cost confirmation দেখান। ভুল ফোন/অসম্পূর্ণ তথ্যের validation এবং সফল test booking, tracking number ও label দেখান।
4. ৩:০০–৪:১৫ — Stripe test checkout সম্পন্ন করুন; provider যাচাইয়ের পর PAID দেখান। success URL একা payment নিশ্চিত করে না তা বলুন। COD পণ্যের টাকা; delivery fee আলাদা।
5. ৪:১৫–৫:৩০ — Admin login; database-backed totals/charts, URL search/page, worker View/Edit, hub dependency safeguard, merchant/worker approval ও parcel assignment দেখান। কোনো প্রকৃত hub/account মুছবেন না।
6. ৫:৩০–৬:৩০ — Courier login; pickup, hub ও delivery task তালিকা এবং server-approved next step দেখান। recipient evidence/acknowledgment ও failed delivery reason বোঝান।
7. ৬:৩০–৭:১৫ — public tracking-এ private contacts না থাকা, retry/loading/empty states এবং legal evaluation boundaries দেখান। COD remittance externally performed এবং manually recorded, automatic payout নয়।
8. ৭:১৫–৮:০০ — public API docs, Postman download, cookie authentication ও safe write flags দেখান। GitHub README ও automated test results দেখান।

## জমা দেওয়ার আগে

- Google Drive/YouTube-এ ভিডিও আপলোড করে evaluator-এর জন্য view access দিন।
- incognito window-তে share link খুলে অনুমতি পরীক্ষা করুন।
- submission-এ দুই repo, দুই live URL, API docs, demo credentials ও আসল video link দিন।
- test-mode payment, manual remittance ও এখনও চালু নয় এমন refund/retention automation স্পষ্ট করে বলুন।
