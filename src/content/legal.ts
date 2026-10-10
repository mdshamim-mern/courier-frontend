export type LegalKind = "terms" | "privacy" | "cookies";
type Section = { title: string; paragraphs: string[] };
type Document = { title: string; sections: Section[] };
export const legalOperator = {
  companyName: "Dropzo",
  contactEmail: "mdshamim.mern@gmail.com",
  contactPhone: "01865-190471",
  address: "Love Road, Mirpur 2, Dhaka",
  effectiveDate: "2026-10-10",
};
export function legalEffectiveDate(locale: string) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${legalOperator.effectiveDate}T00:00:00Z`));
}
const documents: Record<"en" | "bn", Record<LegalKind, Document>> = {
  en: {
    terms: {
      title: "Terms of Service",
      sections: [
        {
          title: "Operator and evaluation scope",
          paragraphs: [
            "Dropzo is an assignment evaluation platform at Love Road, Mirpur 2, Dhaka. Contact mdshamim.mern@gmail.com or 01865-190471. The proposed company name Dropzo Logistics Limited and supplied dummy trade licence are not verified registration claims. Do not book real goods or pay real money in this environment.",
          ],
        },
        {
          title: "Accounts and parcels",
          paragraphs: [
            "Use accurate details and protect passwords and verification codes. Staff and merchant capabilities require administrator approval. Book only lawful, suitably packaged goods in approved service areas. Customers provide addresses; administrators assign hubs and workers. Tracking reports recorded events, not live GPS.",
          ],
        },
        {
          title: "Charges and payment verification",
          paragraphs: [
            "Review the server-approved quote before confirmation. Delivery fees are separate from product COD. Stripe test mode and bKash sandbox do not charge real money. Payment becomes PAID only after server-side provider verification; a success URL alone is insufficient.",
          ],
        },
        {
          title: "Cancellation and proposed refund rules",
          paragraphs: [
            "The implemented customer cancellation action supports eligible pending, unpaid bookings. Paid refunds are not automated. Proposed launch rules are 100% shipping-fee refund before pickup, 50% deduction after pickup but before dispatch, and no cancellation after dispatch. These require operational approval and implementation before real use.",
          ],
        },
        {
          title: "Claims and merchant remittance",
          paragraphs: [
            "Contact support with the tracking number and evidence; never send payment credentials. Proposed claims review takes 7–14 working days, with compensation capped at the lesser of three times shipping fee, declared value and BDT 5,000. Proposed approved refunds take 5–7 working days. These are illustrative, not an implemented guarantee. COD transfers are performed outside the app and recorded manually by administrators with a reference; there is no automatic withdrawal or 24–48-hour payout guarantee.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "Data responsibility",
          paragraphs: [
            "Dropzo handles evaluation data at Love Road, Mirpur 2, Dhaka. Privacy requests should be sent to mdshamim.mern@gmail.com. Do not upload real sensitive information to public demo accounts.",
          ],
        },
        {
          title: "Information and purpose",
          paragraphs: [
            "We store account identifiers, password hashes, contact details, session records, pickup and recipient addresses, parcel values, tracking events, payment references, worker assignments and audit logs. They support authentication, booking, delivery workflow, payment verification and troubleshooting. Sender-supplied recipient data must be authorized.",
          ],
        },
        {
          title: "Access and providers",
          paragraphs: [
            "Role-restricted staff access only the data needed for their duties. Configured services include Vercel hosting, PostgreSQL, Redis, email delivery, Cloudinary images, Google sign-in and payment providers. Public tracking excludes private receiver contact details. Do not share tracking identifiers or session cookies publicly.",
          ],
        },
        {
          title: "Retention and deletion",
          paragraphs: [
            "Current resource deletion is soft deletion; automatic purging and archive schedules are not implemented. The proposed schedule is 30 days after an account deletion request, 3–5 years for financial records and 90 days for tracking logs before archiving. These targets are not claims of legal requirements or automatic enforcement. Contact support for access, correction or deletion requests; identity and linked-record checks are required.",
          ],
        },
        {
          title: "Security and changes",
          paragraphs: [
            "HttpOnly session cookies, server authorization, validation and audit records reduce risk; no absolute security guarantee is made. Report suspected misuse to support. Published revisions update the effective date. Real commercial adoption requires verified practices and appropriate review.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookie Policy",
      sections: [
        {
          title: "Session cookies",
          paragraphs: [
            "Dropzo at Love Road, Mirpur 2, Dhaka uses accessToken and refreshToken cookies for authentication. They are HttpOnly and use secure transport in production. Expiry follows server JWT configuration; refresh and logout can replace or revoke a session. Contact mdshamim.mern@gmail.com for questions.",
          ],
        },
        {
          title: "Preferences and providers",
          paragraphs: [
            "sidebar_state remembers sidebar visibility. Language routing and browser preferences support the interface. Optional Google sign-in and Stripe/bKash checkout may use provider-managed storage on their own sites. No advertising or analytics consent feature is represented as implemented.",
          ],
        },
        {
          title: "Your control",
          paragraphs: [
            "Clear or block cookies in browser settings. Blocking session cookies prevents sign-in and protected actions. Shared demo accounts must not contain private information. Review provider policies before using their services.",
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
          title: "পরিচালনাকারী ও মূল্যায়ন পরিবেশ",
          paragraphs: [
            "Dropzo একটি অ্যাসাইনমেন্ট মূল্যায়ন প্ল্যাটফর্ম। ঠিকানা Love Road, Mirpur 2, Dhaka; যোগাযোগ mdshamim.mern@gmail.com অথবা 01865-190471। প্রস্তাবিত Dropzo Logistics Limited নাম ও দেওয়া ডামি ট্রেড লাইসেন্স যাচাইকৃত নিবন্ধনের দাবি নয়। এখানে বাস্তব পণ্য বা বাস্তব টাকা ব্যবহার করবেন না।",
          ],
        },
        {
          title: "অ্যাকাউন্ট ও পার্সেল",
          paragraphs: [
            "সঠিক তথ্য দিন এবং পাসওয়ার্ড ও যাচাইসংকেত গোপন রাখুন। কর্মী ও ব্যবসায়িক ক্ষমতার জন্য প্রশাসকের অনুমোদন লাগবে। অনুমোদিত এলাকায় বৈধ ও উপযুক্ত মোড়কের পণ্য বুক করুন। গ্রাহক ঠিকানা দেবেন; প্রশাসক হাব ও কর্মী বরাদ্দ করবেন। অনুসরণে নথিভুক্ত অবস্থা দেখায়, সরাসরি GPS নয়।",
          ],
        },
        {
          title: "মাশুল ও অর্থপ্রদানের যাচাই",
          paragraphs: [
            "নিশ্চিত করার আগে সার্ভার অনুমোদিত মাশুল দেখুন। ডেলিভারি মাশুল ও পণ্যের COD আলাদা। Stripe test mode ও bKash sandbox বাস্তব টাকা কাটে না। সার্ভারে প্রদানকারীর যাচাইয়ের পরই PAID হয়; সফলতার URL যথেষ্ট নয়।",
          ],
        },
        {
          title: "বাতিল ও প্রস্তাবিত টাকা ফেরতের নিয়ম",
          paragraphs: [
            "বর্তমানে যোগ্য অপেক্ষমাণ ও অপরিশোধিত বুকিং গ্রাহক বাতিল করতে পারেন। পরিশোধিত মাশুল স্বয়ংক্রিয়ভাবে ফেরত দেওয়া হয় না। প্রস্তাবিত চালুর নিয়ম: সংগ্রহের আগে ১০০% মাশুল ফেরত, সংগ্রহের পরে কিন্তু পাঠানোর আগে ৫০% কাটা এবং পাঠানোর পরে বাতিল নয়। বাস্তব ব্যবহারের আগে অনুমোদন ও বাস্তবায়ন দরকার।",
          ],
        },
        {
          title: "অভিযোগ ও ব্যবসায়ীর পাওনা",
          paragraphs: [
            "অনুসন্ধানসংখ্যা ও প্রমাণ দিয়ে সহায়তায় যোগাযোগ করুন; অর্থপ্রদানের গোপন তথ্য পাঠাবেন না। প্রস্তাবিত অভিযোগ যাচাই ৭–১৪ কর্মদিবস; ক্ষতিপূরণের সীমা মাশুলের তিন গুণ, ঘোষিত মূল্য ও ৫,০০০ টাকার মধ্যে সর্বনিম্ন। প্রস্তাবিত অনুমোদিত টাকা ফেরত ৫–৭ কর্মদিবস। এগুলো উদাহরণ, বাস্তবায়িত নিশ্চয়তা নয়। COD হস্তান্তর অ্যাপের বাইরে করে প্রশাসক রেফারেন্সসহ নথিভুক্ত করেন; স্বয়ংক্রিয় টাকা তোলা বা ২৪–৪৮ ঘণ্টার নিশ্চয়তা নেই।",
          ],
        },
      ],
    },
    privacy: {
      title: "গোপনীয়তার নীতি",
      sections: [
        {
          title: "তথ্য পরিচালনার দায়িত্ব",
          paragraphs: [
            "Dropzo মূল্যায়নের তথ্য পরিচালনা করে। ঠিকানা Love Road, Mirpur 2, Dhaka। গোপনীয়তার অনুরোধ mdshamim.mern@gmail.com-এ পাঠান। প্রকাশ্য demo অ্যাকাউন্টে বাস্তব সংবেদনশীল তথ্য দেবেন না।",
          ],
        },
        {
          title: "তথ্য ও উদ্দেশ্য",
          paragraphs: [
            "পরিচয়, পাসওয়ার্ডের hash, যোগাযোগ, সেশন, সংগ্রহ ও প্রাপকের ঠিকানা, পণ্যের মূল্য, অনুসরণের ঘটনা, অর্থপ্রদানের রেফারেন্স, কাজ বরাদ্দ ও audit log রাখা হয়। এগুলো প্রবেশ, বুকিং, সরবরাহের কাজ, অর্থপ্রদান যাচাই ও সমস্যা সমাধানে ব্যবহৃত হয়। প্রাপকের তথ্য দেওয়ার অনুমতি প্রেরকের থাকতে হবে।",
          ],
        },
        {
          title: "প্রবেশাধিকার ও বাইরের সেবা",
          paragraphs: [
            "অনুমতিপ্রাপ্ত কর্মীরা কাজের প্রয়োজনীয় তথ্য দেখেন। কনফিগার করা সেবার মধ্যে Vercel, PostgreSQL, Redis, ইমেইল, Cloudinary, Google প্রবেশ ও অর্থপ্রদানের প্রতিষ্ঠান রয়েছে। প্রকাশ্য অনুসরণে প্রাপকের ব্যক্তিগত যোগাযোগ দেখানো হয় না। অনুসন্ধানসংখ্যা বা সেশনের কুকি প্রকাশ করবেন না।",
          ],
        },
        {
          title: "সংরক্ষণ ও মুছে ফেলা",
          paragraphs: [
            "বর্তমানে resource মুছে ফেলা soft deletion; স্বয়ংক্রিয় স্থায়ী অপসারণ ও archive সময়সূচি চালু নয়। প্রস্তাবিত সময়: অ্যাকাউন্ট মুছতে অনুরোধের পরে ৩০ দিন, আর্থিক তথ্য ৩–৫ বছর এবং tracking log archive-এর আগে ৯০ দিন। এগুলো আইনি বাধ্যবাধকতা বা স্বয়ংক্রিয় বাস্তবায়নের দাবি নয়। তথ্য দেখা, সংশোধন বা অপসারণের অনুরোধ সহায়তায় পাঠান; পরিচয় ও সংশ্লিষ্ট তথ্য যাচাই লাগবে।",
          ],
        },
        {
          title: "নিরাপত্তা ও পরিবর্তন",
          paragraphs: [
            "HttpOnly session cookie, সার্ভারের অনুমতি যাচাই, validation ও audit record ঝুঁকি কমায়; সম্পূর্ণ নিরাপত্তার নিশ্চয়তা নয়। সন্দেহজনক ব্যবহার সহায়তায় জানান। পরিবর্তনে কার্যকর তারিখ হালনাগাদ হবে। বাস্তব বাণিজ্যিক ব্যবহারে কার্যক্রম যাচাই ও উপযুক্ত পর্যালোচনা দরকার।",
          ],
        },
      ],
    },
    cookies: {
      title: "কুকির নীতি",
      sections: [
        {
          title: "সেশনের কুকি",
          paragraphs: [
            "Love Road, Mirpur 2, Dhaka-এর Dropzo প্রবেশের জন্য accessToken ও refreshToken cookie ব্যবহার করে। এগুলো HttpOnly এবং production-এ নিরাপদ সংযোগ ব্যবহার করে। মেয়াদ সার্ভারের JWT configuration অনুযায়ী; refresh ও logout সেশন বদলাতে বা বাতিল করতে পারে। প্রশ্ন পাঠান mdshamim.mern@gmail.com-এ।",
          ],
        },
        {
          title: "পছন্দ ও বাইরের সেবা",
          paragraphs: [
            "sidebar_state sidebar দেখানোর পছন্দ রাখে। ভাষার routing ও browser preference interface-কে সহায়তা করে। ঐচ্ছিক Google প্রবেশ ও Stripe/bKash checkout তাদের নিজস্ব সাইটে storage ব্যবহার করতে পারে। বিজ্ঞাপন বা analytics consent-এর ব্যবস্থা চালু আছে বলে দাবি করা হয় না।",
          ],
        },
        {
          title: "আপনার নিয়ন্ত্রণ",
          paragraphs: [
            "browser settings থেকে cookie মুছতে বা বন্ধ করতে পারেন। সেশনের cookie বন্ধ করলে প্রবেশ ও অনুমতিনির্ভর কাজ বন্ধ হবে। shared demo অ্যাকাউন্টে ব্যক্তিগত তথ্য রাখবেন না। বাইরের সেবা ব্যবহারের আগে তাদের নীতি পড়ুন।",
          ],
        },
      ],
    },
  },
};
export function getLegalDocument(locale: string, kind: LegalKind) {
  return documents[locale === "bn" ? "bn" : "en"][kind];
}
