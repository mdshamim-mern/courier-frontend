export type LegalKind = "terms" | "privacy" | "cookies";
type Section = { title: string; paragraphs: string[] };
type Document = { title: string; sections: Section[] };

const documents: Record<"en" | "bn", Record<LegalKind, Document>> = {
  en: {
    terms: {
      title: "Terms of Service",
      sections: [
        {
          title: "1. Operator and scope",
          paragraphs: [
            "[Company Name], located at [Address], operates this courier platform. These draft terms cover account access, parcel booking, tracking and payment. Effective date: [Effective Date]. Contact: [Contact Email].",
          ],
        },
        {
          title: "2. Accounts and eligibility",
          paragraphs: [
            "Provide accurate account details, keep credentials and verification codes private, and report unauthorized access. Eligibility and age requirements: [Age Requirement]. Administrative and courier accounts require authorization from the operator.",
          ],
        },
        {
          title: "3. Parcel booking and responsibilities",
          paragraphs: [
            "Provide accurate recipient details, weight, addresses and hub selections. Ensure you are entitled to share recipient information and that the parcel is lawfully transportable and suitably packaged.",
            "Service areas, delivery estimates, restricted goods, packaging requirements and failed-delivery procedures: [Delivery Terms]. Confirm these details before booking; a tracking update is not a delivery guarantee.",
          ],
        },
        {
          title: "4. Prices, payments and refunds",
          paragraphs: [
            "Review the displayed charge before paying. A payment is confirmed only after provider verification and a recorded paid status; visiting a success URL alone does not confirm payment.",
            "Stripe or bKash may process payments when configured. Applicable charges, taxes, cancellations, refunds, cash-on-delivery arrangements and settlement times: [Payment and Refund Policy]. Provider terms may also apply. Do not submit card or wallet credentials through support messages.",
          ],
        },
        {
          title: "5. Acceptable use",
          paragraphs: [
            "Do not use the service for unlawful parcels, fraud, impersonation, unauthorized access, interference with tracking or payments, or disclosure of another person's private information. Access may be restricted to protect the service, subject to applicable law and [Account Suspension and Appeal Process].",
          ],
        },
        {
          title: "6. Service limitations and complaints",
          paragraphs: [
            "Delivery may be affected by route conditions, incomplete recipient information or external service interruptions. Loss, damage, delays, insurance, compensation limits and the complaint procedure must be set out in [Liability and Claims Policy]. This draft does not waive mandatory consumer rights or create a blanket exclusion of liability.",
          ],
        },
        {
          title: "7. Data, ownership and changes",
          paragraphs: [
            "Personal information is described in the Privacy Policy and Cookie Policy. Platform materials belong to their respective owners; using the platform does not transfer ownership of them.",
            "Material changes, notice periods and any account-closure procedure: [Policy Change and Termination Process]. State the applicable law and dispute process only after review: [Jurisdiction and Dispute Resolution].",
          ],
        },
        {
          title: "8. Before final publication",
          paragraphs: [
            "Replace all bracketed placeholders, confirm actual operating practices, publish verified contact information and obtain legal review for the territories served. This is a working draft, not a representation of legal compliance.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "1. Who handles your information",
          paragraphs: [
            "[Company Name], [Address], is responsible for the platform's handling of personal information. Contact [Contact Email] for privacy questions. Effective date: [Effective Date]. Privacy representative, if required: [Privacy Contact].",
          ],
        },
        {
          title: "2. Information collected and its sources",
          paragraphs: [
            "Account information may include name, email, phone, address, password hash and verification or session records. Optional profile images and courier contact, vehicle and hub information are handled when supplied.",
            "Parcel information includes sender references, recipient name, phone, delivery address, weight, selected hubs and tracking history. Recipient details are supplied by the sender. Payment records contain amount, provider, payment status and transaction references.",
            "Security and activity records can include request metadata and administrative audit events. Complete the deployment-specific inventory here: [Data Inventory and Sources].",
          ],
        },
        {
          title: "3. Why information is used",
          paragraphs: [
            "Information is used to authenticate accounts, arrange and track deliveries, reconcile payments, send verification or password-reset messages, support users and investigate misuse. Required booking details are needed to fulfill a delivery request.",
            "Specify the legal basis for each purpose under the law that actually applies: [Purpose and Lawful Basis Schedule]. Optional marketing, analytics or automated decision-making must be described separately before activation: [Optional Processing Details].",
          ],
        },
        {
          title: "4. Sharing and external providers",
          paragraphs: [
            "Authorized staff and assigned couriers receive information needed for their duties. Configured payment providers, email delivery, image storage, hosting, databases and other infrastructure services may process necessary information.",
            "Identify each active provider, what it receives, processing locations and applicable safeguards: [Processors and International Transfers]. Avoid listing an integration as active unless it is configured and used.",
          ],
        },
        {
          title: "5. Public tracking and security",
          paragraphs: [
            "Public tracking is designed to expose shipment status and history rather than recipient contact details. Keep tracking identifiers private. Authentication uses session cookies and access controls; technical measures reduce risk but cannot guarantee absolute security.",
            "State incident reporting, notification requirements and operational safeguards after review: [Security and Incident Process].",
          ],
        },
        {
          title: "6. Storage and deletion",
          paragraphs: [
            "Retention and deletion schedules for account, parcel, payment, image, verification, security and audit records: [Retention Schedule]. State any legal recordkeeping obligations, backup deletion delays and account-deletion process. Do not claim data is automatically deleted until that process is implemented and verified.",
          ],
        },
        {
          title: "7. Your choices and requests",
          paragraphs: [
            "You can update available profile fields and contact [Contact Email] to request access, correction, deletion or other rights available under applicable law. Explain identity checks, response times, consent withdrawal, limitations and how to appeal: [Rights Request Procedure].",
            "Privacy complaints and the appropriate regulator, if applicable: [Complaint Process and Supervisory Authority]. Requests may require retention of records where the applicable law requires it.",
          ],
        },
        {
          title: "8. Cookies, age requirements and updates",
          paragraphs: [
            "See the Cookie Policy for session cookies and browser preferences. Eligibility and handling of children's information: [Age Requirement and Children's Privacy]. Changes will be announced through [Privacy Change Notification Process].",
            "Fill every placeholder, verify the actual data flows and seek legal review before adopting this document as a final policy. No jurisdiction-specific compliance claim is made by this draft.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      sections: [
        {
          title: "1. Authentication cookies",
          paragraphs: [
            "The backend uses accessToken and refreshToken cookies for signed-in sessions. Production settings should use HTTPS with Secure and HttpOnly protections. Cookie lifetimes and scope: [Cookie Lifetime and Domain Inventory]. These values must match the deployed authentication configuration.",
          ],
        },
        {
          title: "2. Interface preferences",
          paragraphs: [
            "The sidebar_state cookie remembers the dashboard sidebar preference. Locale routing and any locale cookie depend on the deployed language configuration. Record exact names, purposes, durations and providers: [Cookie Inventory].",
          ],
        },
        {
          title: "3. External services and consent",
          paragraphs: [
            "Optional Google sign-in and configured payment services may use their own storage or cookies. Review the actual provider inventory and consent obligations in [Third-party Cookie and Consent Assessment].",
            "Do not enable non-essential analytics or advertising before documenting their purposes and implementing any consent required by the applicable law. This draft does not certify that optional cookies are absent.",
          ],
        },
        {
          title: "4. Managing storage",
          paragraphs: [
            "You can clear or block cookies using browser settings. Blocking session cookies can prevent sign-in and authenticated functions from working. Contact [Contact Email] at [Company Name], [Address], for questions. Effective date: [Effective Date].",
          ],
        },
      ],
    },
  },
  bn: {
    terms: {
      title: "ব্যবহারের শর্তাবলী",
      sections: [
        {
          title: "১. পরিচালনাকারী ও প্রযোজ্য সেবা",
          paragraphs: [
            "[Address] ঠিকানায় অবস্থিত [Company Name] এই পার্সেল পরিবহনব্যবস্থা পরিচালনা করে। অ্যাকাউন্ট ব্যবহার, পার্সেলের অনুরোধ, অনুসরণ ও অর্থপ্রদান এই খসড়ার আওতায় পড়ে। কার্যকর হওয়ার তারিখ: [Effective Date]। যোগাযোগ: [Contact Email]।",
          ],
        },
        {
          title: "২. অ্যাকাউন্ট ও যোগ্যতা",
          paragraphs: [
            "অ্যাকাউন্টের সঠিক তথ্য দিন, পাসওয়ার্ড ও যাচাইয়ের সংকেত গোপন রাখুন এবং অননুমোদিত ব্যবহার জানিয়ে দিন। বয়স ও ব্যবহারের যোগ্যতা: [Age Requirement]। প্রশাসক ও বাহকের অ্যাকাউন্টের জন্য প্রতিষ্ঠানের অনুমোদন প্রয়োজন।",
          ],
        },
        {
          title: "৩. পার্সেলের অনুরোধ ও দায়িত্ব",
          paragraphs: [
            "প্রাপকের পরিচয়, ফোন, ঠিকানা, ওজন ও হাবের সঠিক তথ্য দিন। প্রাপকের তথ্য দেওয়ার বৈধ অধিকার, পণ্যের বৈধতা ও উপযুক্ত মোড়ক নিশ্চিত করুন।",
            "সেবার আওতা, সম্ভাব্য সরবরাহের সময়, নিষিদ্ধ পণ্য, মোড়কের নিয়ম ও ব্যর্থ সরবরাহের ব্যবস্থা: [Delivery Terms]। বুকিংয়ের আগে এগুলো নিশ্চিত করুন। অনুসরণের হালনাগাদ তথ্য সরবরাহের নিশ্চয়তা নয়।",
          ],
        },
        {
          title: "৪. মূল্য, অর্থপ্রদান ও ফেরত",
          paragraphs: [
            "পরিশোধের আগে প্রদর্শিত মূল্য যাচাই করুন। অর্থপ্রদানকারী প্রতিষ্ঠানের যাচাই এবং সার্ভারে পরিশোধিত অবস্থা নথিভুক্ত হওয়ার পরেই অর্থপ্রদান নিশ্চিত হয়। সফলতার পাতায় প্রবেশ করলেই অর্থপ্রদান নিশ্চিত হয় না।",
            "চালু থাকলে Stripe বা bKash অর্থপ্রদান প্রক্রিয়া সম্পন্ন করতে পারে। মূল্য, কর, বাতিল, টাকা ফেরত, পণ্য হাতে পেয়ে মূল্য পরিশোধ ও নিষ্পত্তির সময়: [Payment and Refund Policy]। সংশ্লিষ্ট প্রতিষ্ঠানের শর্তও প্রযোজ্য হতে পারে। সহায়তার বার্তায় কার্ড বা ওয়ালেটের গোপন তথ্য দেবেন না।",
          ],
        },
        {
          title: "৫. গ্রহণযোগ্য ব্যবহার",
          paragraphs: [
            "অবৈধ পণ্য, প্রতারণা, পরিচয় জালিয়াতি, অননুমোদিত প্রবেশ, পার্সেল বা অর্থপ্রদানের তথ্য বিকৃতি এবং অন্যের ব্যক্তিগত তথ্য প্রকাশের জন্য সেবা ব্যবহার করবেন না। সুরক্ষার জন্য প্রযোজ্য আইন ও [Account Suspension and Appeal Process] অনুযায়ী প্রবেশ সীমিত করা হতে পারে।",
          ],
        },
        {
          title: "৬. সীমাবদ্ধতা ও অভিযোগ",
          paragraphs: [
            "পথের পরিস্থিতি, অসম্পূর্ণ প্রাপকের তথ্য বা বাইরের সেবার সমস্যায় সরবরাহ বাধাগ্রস্ত হতে পারে। ক্ষতি, বিলম্ব, বিমা, ক্ষতিপূরণের সীমা ও অভিযোগের পদ্ধতি লিখুন: [Liability and Claims Policy]। এই খসড়া বাধ্যতামূলক ভোক্তা অধিকার বাতিল করে না এবং সব দায় থেকে অব্যাহতি দেয় না।",
          ],
        },
        {
          title: "৭. তথ্য, মালিকানা ও পরিবর্তন",
          paragraphs: [
            "ব্যক্তিগত তথ্যের ব্যবহার গোপনীয়তার নীতি ও কুকির নীতিতে বর্ণিত। ব্যবস্থার উপকরণের মালিকানা সংশ্লিষ্ট মালিকের; ব্যবহার করলে মালিকানা হস্তান্তর হয় না।",
            "গুরুত্বপূর্ণ পরিবর্তন জানানো, নোটিশ ও অ্যাকাউন্ট বন্ধের পদ্ধতি: [Policy Change and Termination Process]। পর্যালোচনার পরে প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি লিখুন: [Jurisdiction and Dispute Resolution]।",
          ],
        },
        {
          title: "৮. চূড়ান্ত প্রকাশের আগে",
          paragraphs: [
            "বন্ধনীর সব প্লেসহোল্ডার পূরণ করুন, বাস্তব পরিচালনার নিয়ম যাচাই করুন, সঠিক যোগাযোগের তথ্য দিন এবং সেবার আওতাভুক্ত এলাকার জন্য আইনি পর্যালোচনা করান। এটি কাজের খসড়া, আইন মেনে চলার প্রত্যয়ন নয়।",
          ],
        },
      ],
    },
    privacy: {
      title: "গোপনীয়তার নীতি",
      sections: [
        {
          title: "১. তথ্য পরিচালনার দায়িত্ব",
          paragraphs: [
            "[Company Name], [Address], এই ব্যবস্থায় ব্যক্তিগত তথ্য পরিচালনার জন্য দায়ী। গোপনীয়তা নিয়ে যোগাযোগ: [Contact Email]। কার্যকর হওয়ার তারিখ: [Effective Date]। প্রয়োজন হলে গোপনীয়তার প্রতিনিধি: [Privacy Contact]।",
          ],
        },
        {
          title: "২. সংগৃহীত তথ্য ও উৎস",
          paragraphs: [
            "অ্যাকাউন্টের তথ্যে নাম, ইমেইল, ফোন, ঠিকানা, পাসওয়ার্ডের হ্যাশ এবং যাচাই বা সেশনের নথি থাকতে পারে। দেওয়া হলে ঐচ্ছিক প্রোফাইল ছবি, বাহকের যোগাযোগ, যানবাহন ও হাবের তথ্য পরিচালিত হয়।",
            "পার্সেলের তথ্যে প্রেরকের পরিচয়, প্রাপকের নাম, ফোন, ঠিকানা, ওজন, নির্বাচিত হাব ও পথের ইতিহাস থাকে। প্রাপকের তথ্য প্রেরক দেন। অর্থপ্রদানের নথিতে পরিমাণ, মাধ্যম, অবস্থা ও লেনদেনের পরিচয় থাকে।",
            "নিরাপত্তা ও কার্যক্রমের নথিতে অনুরোধের কারিগরি তথ্য ও প্রশাসনিক ঘটনা থাকতে পারে। বাস্তব ব্যবস্থার তথ্যের পূর্ণ তালিকা লিখুন: [Data Inventory and Sources]।",
          ],
        },
        {
          title: "৩. তথ্য ব্যবহারের উদ্দেশ্য",
          paragraphs: [
            "অ্যাকাউন্ট যাচাই, পার্সেল পাঠানো ও অনুসরণ, অর্থপ্রদান যাচাই, নিবন্ধন বা পাসওয়ার্ড বদলানোর বার্তা পাঠানো, সহায়তা ও অপব্যবহার শনাক্ত করতে তথ্য ব্যবহার করা হয়। সরবরাহের অনুরোধ সম্পন্ন করতে প্রয়োজনীয় তথ্য দিতে হয়।",
            "যে আইন বাস্তবে প্রযোজ্য, সে অনুযায়ী প্রতিটি উদ্দেশ্যের বৈধ ভিত্তি লিখুন: [Purpose and Lawful Basis Schedule]। ঐচ্ছিক প্রচার, ব্যবহার বিশ্লেষণ বা স্বয়ংক্রিয় সিদ্ধান্ত চালুর আগে আলাদা বিবরণ দিন: [Optional Processing Details]।",
          ],
        },
        {
          title: "৪. তথ্য ভাগ করা ও বাইরের সেবা",
          paragraphs: [
            "অনুমোদিত কর্মী ও নির্ধারিত বাহক তাঁদের কাজের প্রয়োজনীয় তথ্য পান। চালু থাকা অর্থপ্রদান, ইমেইল, ছবি সংরক্ষণ, হোস্টিং, ডেটাবেস ও অবকাঠামোর সেবা প্রয়োজনীয় তথ্য প্রক্রিয়াকরণ করতে পারে।",
            "প্রতিটি চালু প্রতিষ্ঠানের নাম, প্রাপ্ত তথ্য, প্রক্রিয়াকরণের দেশ ও সুরক্ষাব্যবস্থা লিখুন: [Processors and International Transfers]। কোনো সংযোগ বাস্তবে চালু ও ব্যবহৃত না হলে তাকে সক্রিয় বলে লিখবেন না।",
          ],
        },
        {
          title: "৫. প্রকাশ্য অনুসরণ ও নিরাপত্তা",
          paragraphs: [
            "প্রকাশ্য অনুসরণে প্রাপকের যোগাযোগের তথ্যের বদলে পার্সেলের অবস্থা ও ইতিহাস দেখানোর ব্যবস্থা রয়েছে। অনুসন্ধানসংখ্যা গোপন রাখুন। পরিচয় যাচাইয়ে সেশন কুকি ও প্রবেশের নিয়ন্ত্রণ ব্যবহৃত হয়। নিরাপত্তাব্যবস্থা ঝুঁকি কমায়, সম্পূর্ণ নিরাপত্তার নিশ্চয়তা দেয় না।",
            "ঘটনা জানানো, প্রযোজ্য বিজ্ঞপ্তি ও পরিচালনাগত সুরক্ষাব্যবস্থা পর্যালোচনা করে লিখুন: [Security and Incident Process]।",
          ],
        },
        {
          title: "৬. সংরক্ষণ ও মুছে ফেলা",
          paragraphs: [
            "অ্যাকাউন্ট, পার্সেল, অর্থপ্রদান, ছবি, যাচাই, নিরাপত্তা ও কার্যক্রমের তথ্য রাখার সময় এবং মুছে ফেলার নিয়ম: [Retention Schedule]। আইনগত সংরক্ষণ, ব্যাকআপ মোছার বিলম্ব ও অ্যাকাউন্ট মুছে ফেলার পদ্ধতি লিখুন। ব্যবস্থা তৈরি ও যাচাই না হওয়া পর্যন্ত স্বয়ংক্রিয়ভাবে তথ্য মুছে ফেলার দাবি করবেন না।",
          ],
        },
        {
          title: "৭. আপনার পছন্দ ও অনুরোধ",
          paragraphs: [
            "উপলব্ধ প্রোফাইলের ঘরগুলো বদলাতে পারেন। প্রযোজ্য আইনে তথ্য দেখা, সংশোধন, মুছে ফেলা বা অন্য অধিকার প্রয়োগের জন্য [Contact Email] ঠিকানায় অনুরোধ করুন। পরিচয় যাচাই, উত্তর দেওয়ার সময়, সম্মতি প্রত্যাহার, সীমাবদ্ধতা ও আপিলের পদ্ধতি: [Rights Request Procedure]।",
            "গোপনীয়তার অভিযোগ ও প্রযোজ্য নিয়ন্ত্রক কর্তৃপক্ষ: [Complaint Process and Supervisory Authority]। প্রযোজ্য আইন অনুযায়ী কিছু নথি সংরক্ষণ করা প্রয়োজন হতে পারে।",
          ],
        },
        {
          title: "৮. কুকি, বয়স ও পরিবর্তন",
          paragraphs: [
            "সেশন কুকি ও ব্রাউজারের পছন্দের জন্য কুকির নীতি দেখুন। বয়সের যোগ্যতা ও শিশুদের তথ্যের নিয়ম: [Age Requirement and Children's Privacy]। নীতির পরিবর্তন জানানোর পদ্ধতি: [Privacy Change Notification Process]।",
            "চূড়ান্ত নীতি হিসেবে গ্রহণের আগে সব প্লেসহোল্ডার পূরণ, বাস্তব তথ্যের প্রবাহ যাচাই ও আইনি পর্যালোচনা করুন। এই খসড়া কোনো নির্দিষ্ট দেশের আইন মেনে চলার নিশ্চয়তা দেয় না।",
          ],
        },
      ],
    },
    cookies: {
      title: "কুকির নীতি",
      sections: [
        {
          title: "১. পরিচয় যাচাইয়ের কুকি",
          paragraphs: [
            "ব্যাকএন্ডে অ্যাকাউন্টের সেশনের জন্য accessToken ও refreshToken কুকি ব্যবহৃত হয়। প্রোডাকশনে HTTPS এবং Secure ও HttpOnly সুরক্ষা প্রয়োগ করা উচিত। কুকির মেয়াদ ও আওতা: [Cookie Lifetime and Domain Inventory]। প্রকাশিত তথ্যের সঙ্গে বাস্তব কনফিগারেশন মিলতে হবে।",
          ],
        },
        {
          title: "২. পর্দার পছন্দ",
          paragraphs: [
            "sidebar_state কুকি ড্যাশবোর্ডের পাশের মেনুর পছন্দ মনে রাখে। ভাষার পথ ও ভাষা-সংক্রান্ত কুকি বাস্তব ভাষা-কনফিগারেশনের ওপর নির্ভর করে। নাম, উদ্দেশ্য, মেয়াদ ও সেবাদাতার পূর্ণ তালিকা: [Cookie Inventory]।",
          ],
        },
        {
          title: "৩. বাইরের সেবা ও সম্মতি",
          paragraphs: [
            "ঐচ্ছিক গুগল প্রবেশ ও চালু অর্থপ্রদানের সেবা নিজস্ব কুকি বা সংরক্ষণ ব্যবহার করতে পারে। বাস্তব তালিকা ও সম্মতির প্রয়োজন পর্যালোচনা করুন: [Third-party Cookie and Consent Assessment]।",
            "অপ্রয়োজনীয় ব্যবহার-বিশ্লেষণ বা বিজ্ঞাপন চালুর আগে উদ্দেশ্য লিখুন এবং প্রযোজ্য আইনে দরকার হলে সম্মতির ব্যবস্থা করুন। এই খসড়া ঐচ্ছিক কুকি নেই বলে প্রত্যয়ন করে না।",
          ],
        },
        {
          title: "৪. সংরক্ষণ নিয়ন্ত্রণ",
          paragraphs: [
            "ব্রাউজারের সেটিংস দিয়ে কুকি মুছতে বা বন্ধ করতে পারেন। সেশনের কুকি বন্ধ করলে প্রবেশ ও অনুমতিনির্ভর কাজ বন্ধ হতে পারে। প্রশ্নের জন্য [Company Name], [Address], [Contact Email] ঠিকানায় যোগাযোগ করুন। কার্যকর হওয়ার তারিখ: [Effective Date]।",
          ],
        },
      ],
    },
  },
};

export function getLegalDocument(locale: string, kind: LegalKind) {
  return documents[locale === "bn" ? "bn" : "en"][kind];
}
