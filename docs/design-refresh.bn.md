# Dropzo: বেগুনি responsive নকশা

তারিখ: ৯ অক্টোবর ২০২৬।

## কী বদলেছে

- পুরোনো নীল লোগো বদলে নিজস্ব বেগুনি পার্সেল-চিহ্ন ও Dropzo wordmark। অন্য প্রতিষ্ঠানের লোগো কপি করা হয়নি।
- সাইটজুড়ে বেগুনি–ল্যাভেন্ডার রঙ, হালকা স্বচ্ছ কার্ড, blur, border ও shadow। ভুলের বার্তা এবং সেবার অবস্থার আলাদা অর্থবহ রঙ অক্ষত।
- ১২৮০ পিক্সেল থেকে ডেস্কটপ নেভিগেশন এক সারি। ছোট পর্দায় খোলা–বন্ধ করা যায় এমন মেনু; কর্মীর আবেদন ও প্রবেশের লিংক বাদ যায়নি।
- বাস্তব header-এর উচ্চতা অনুযায়ী sidebar অবস্থান। Sidebar এখন dashboard-এর সীমানায় থাকে; footer বা Overview-এর ওপর ওঠে না। মোবাইলে accessible drawer এবং ডেস্কটপে collapse কাজ করে।
- মূল main-এর মধ্যে দ্বিতীয় main বাদ দিয়ে section ব্যবহার করা হয়েছে। Footer স্বাভাবিক document flow-এ আছে।
- হোমে নতুন নিজস্ব SVG ভ্যান, পার্সেল ও route illustration। বুকিং, tracking, খরচ হিসাব এবং কর্মীর আবেদন আগের মতো কাজ করে।
- About, Contact, Services, FAQ, নিবন্ধন, বুকিং ও সাধারণ কার্ডের responsive styling মিলিয়ে নেওয়া হয়েছে।
- প্রধান input ও button-এর touch height অন্তত ৪৪ পিক্সেল। Keyboard focus দৃশ্যমান; reduced-motion preference মানা হয়।
- Footer-এর সাল আর হাজারের কমাসহ দেখায় না।
- Print layout-এ dashboard-এর সংকুচিত width বাদ যায়; দুই পার্সেল থেকে দুইটি পৃথক লেবেল-পৃষ্ঠা হয়।

## এলাকার ভাষা

Coverage, খরচ হিসাব, বুকিং, নির্ধারিত শাখা এবং প্রশাসকের area/hub dropdown-এ একই locale-aware নাম ব্যবহার হয়। বর্তমানে চালু নয়টি এলাকার ইংরেজি–বাংলা নাম যুক্ত আছে। এলাকা ও প্রাপ্যতা API/ডেটাবেস থেকেই আসে; পরিচয়সংখ্যা, হাবের বরাদ্দ, মূল্য বা সার্ভারের validation বদলানো হয়নি। দুই ভাষাতেই অনুসন্ধান কাজ করে।

নতুন অপরিচিত এলাকার নাম অনুমান করে অনুবাদ করা হয় না; সেটি মূল নামেই দেখা যায়। নতুন এলাকা চালু করলে তার অনুমোদিত অনুবাদ src/i18n/geography.ts-এ যোগ করতে হবে। ব্যক্তিগত ঠিকানা বা ব্যবহারকারীর লেখা স্বয়ংক্রিয়ভাবে বদলানো হয় না।

## যাচাইয়ের ফল

- npm run build: সফল।
- npm run typecheck: সফল।
- npm run lint: সফল; sidebar-এর আগে থেকে থাকা document.cookie সম্পর্কে একটি সতর্কতা আছে, নতুন lint error নেই।
- npm run audit:security: কোনো vulnerability পাওয়া যায়নি।
- Microsoft Edge-এ ৭৩টি browser test পাস: আগের ৫৪টি এবং নতুন ১৯টি।
- ৩৬০, ৩৯০, ৭৬৮, ১০২৪, ১২৮০, ১৩৬৬ ও ১৪৪০ পিক্সেল পর্দা পরীক্ষা করা হয়েছে।
- বাংলা ও ইংরেজি navbar, bilingual search, area ID অক্ষত রাখা, তিনটি role-এর dashboard, sidebar collapse/drawer, footer separation, booking, COD হিসাব, payment reconciliation, label printing ও security headers যাচাই হয়েছে।
- Home desktop/mobile, About, Contact mobile, Coverage এবং booking dashboard-এর screenshot দেখে নকশা যাচাই করা হয়েছে।
- নতুন কোডে comment যোগ করা হয়নি।

এই পরিবর্তনে backend, ডেটাবেস, মাইগ্রেশন, approved tariff বা provider credential পরিবর্তন করা হয়নি। Browser পরীক্ষায় API mocks ব্যবহার হয়েছে; নতুন বাস্তব payment করা হয়নি। bKash-এর provider-side wallet lock সম্পর্কিত পরীক্ষা স্থগিতই আছে।
