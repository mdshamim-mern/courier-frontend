# About redesign ও live booking যাচাই

## About পাতার পরিবর্তন

- মূল layout, navigation, purple brand ও logo অপরিবর্তিত।
- দুই কলামের glass hero, সংগ্রহ–হাব–ডেলিভারির ধাপচিত্র, ছয়টি process card, tracking/COD/service coverage-এর তথ্য এবং booking/pricing/contact link।
- পাতাভিত্তিক CSS Module; অন্য পাতায় নতুন style ছড়ায় না।
- বাংলা–ইংরেজি লেখা, বাংলা ধাপসংখ্যা, ছোট screen-এর এক কলাম, ৪৪ পিক্সেল touch target এবং reduced-motion সমর্থন।
- সরাসরি GPS, স্বয়ংক্রিয় ব্যবসায়ীর টাকা পাঠানো বা অযাচাইকৃত সংখ্যার দাবি নেই।

## যাচাই

- Production build, TypeScript ও lint সফল। sidebar.tsx-এর আগের document.cookie warning আছে।
- About-এর ১০টি regression test সফল: দুই ভাষা × ৩৬০, ৩৯০, ৭৬৮, ১০২৪ ও ১৩৬৬ পিক্সেল।
- Desktop ও বাংলা mobile screenshot দেখে layout যাচাই করা হয়েছে।
- সম্পূর্ণ regression suite: ১০৮টি সফল। About-এর ১০টি এবং admin management-এর ১৪টি পরীক্ষাও এর অন্তর্ভুক্ত।
- ব্যবহারকারীর অনুমোদনে Legal পাতার খসড়া সতর্কতা ফিরিয়ে এবং বাংলা FAQ-এর ইংরেজি শব্দ ঠিক করে আগের ৭টি failure সমাধান হয়েছে; নতুন glassy নকশা রাখা হয়েছে।

## অনুমোদিত live test booking

ব্যবহারকারী Bob Merly-এর আবেদন নিজে অনুমোদন করবেন এবং খোলা Dropzo browser-এ merchant login করবেন। এখনো booking বা payment তৈরি করা হয়নি।

আগের read-only baseline: customer ৪, courier ৭, shipment ২২ এবং PAID payment-এর মোট ১৮০০ টাকা। তখন Bob Merly অনুমোদিত ছিলেন না। পরবর্তী পরীক্ষা শুরুর আগে বর্তমান অনুমোদন ও live quote আবার যাচাই করতে হবে। এই সংখ্যা পরীক্ষামূলক ডেটাবেসের রেকর্ড; বাস্তব বাণিজ্যিক আয়ের দাবি নয়।

নির্ধারিত test record: ধানমন্ডি থেকে মিরপুর, ১ কেজি, পণ্যের মূল্য ও COD ১৫০০ টাকা, সংগ্রহ ১১ অক্টোবর ২০২৬ সকাল ১০টা (বাংলাদেশ সময়)। রেকর্ডে physical collection/delivery নয়, পরীক্ষামূলক booking হিসেবে চিহ্নিত করতে হবে।

অনুমোদিত পথে প্রত্যাশিত ডেলিভারি মাশুল ৬০ টাকা এবং COD মাশুল ১৫ টাকা; ব্যবসায়ীর প্রত্যাশিত পাওনা ১৪৮৫ টাকা। এগুলো live quote থেকে আবার যাচাই করতে হবে। COD অর্থ ডেলিভারি মাশুলে যোগ করে payment করা যাবে না।

Stripe test ও bKash sandbox ছাড়া বাস্তব অর্থ পরিশোধ অনুমোদিত নয়। Provider-এর minimum amount বা sandbox wallet সীমাবদ্ধতা হলে booking-এর ওজন/মাশুল বদলে বা কৃত্রিম PAID লিখে পরীক্ষা সফল দেখানো যাবে না।

About, admin UI এবং অনুমোদিত Legal/FAQ সংশোধন একই frontend release-এর অংশ। GitHub-এর main branch থেকে Vercel production deployment হয়। Admin যাচাইয়ের বিস্তারিত `admin-management-verification.bn.md`-তে আছে।
