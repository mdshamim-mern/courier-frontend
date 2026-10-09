import type { Metadata } from "next";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { legalOperator } from "@/content/legal";

const questions = {
  en: [
    [
      "How do I track a parcel?",
      "Use the tracking ID on the Track Shipment page. Public tracking shows the status and timeline, not recipient contact details.",
    ],
    [
      "How is payment confirmed?",
      "A payment becomes confirmed only after the server verifies it with the provider. A success URL alone is not proof of payment. Use Check Payment to view or recheck the recorded status.",
    ],
    [
      "Can I cancel a shipment?",
      "The customer dashboard offers cancellation only while a shipment is pending and unpaid. Paid cancellations require a separately reviewed refund; automatic refunds are not available.",
    ],
    [
      "How do I reset my password?",
      "Use Forgot Password, enter your registered email and follow the verification-code instructions. Never share the code or your password with anyone.",
    ],
    [
      "What are the delivery time and support hours?",
      "Check the coverage page and route calculator for approved areas and estimated delivery time. Confirm restricted items and support hours with Dropzo before booking.",
    ],
    [
      "How do I contact support?",
      `Email ${legalOperator.contactEmail} or call ${legalOperator.contactPhone}. The Contact page lists the office address and support hours. This site does not provide a contact form.`,
    ],
  ],
  bn: [
    [
      "পার্সেল কীভাবে খুঁজব?",
      "পার্সেল অনুসরণের পাতায় অনুসন্ধানসংখ্যা দিন। প্রকাশ্য অনুসরণে অবস্থা ও পথের ইতিহাস দেখা যায়, প্রাপকের যোগাযোগের তথ্য নয়।",
    ],
    [
      "অর্থপ্রদান কীভাবে নিশ্চিত হয়?",
      "সার্ভারে অর্থপ্রদানকারী প্রতিষ্ঠানের সঙ্গে যাচাইয়ের পর অর্থপ্রদান নিশ্চিত হয়। শুধু সফলতার পাতায় যাওয়া প্রমাণ নয়। নথিভুক্ত অবস্থা দেখতে বা আবার যাচাই করতে অর্থপ্রদান যাচাইয়ের বোতাম ব্যবহার করুন।",
    ],
    [
      "পার্সেলের অনুরোধ বাতিল করতে পারব?",
      "পার্সেল অপেক্ষমাণ ও অপরিশোধিত থাকলে গ্রাহকের ড্যাশবোর্ডে বাতিলের সুযোগ থাকে। পরিশোধিত বুকিং বাতিলের আগে আলাদাভাবে ফেরত পর্যালোচনা প্রয়োজন; স্বয়ংক্রিয় টাকা ফেরত দেওয়া হয় না।",
    ],
    [
      "পাসওয়ার্ড কীভাবে বদলাব?",
      "পাসওয়ার্ড ভুলে যাওয়ার পাতায় নিবন্ধিত ইমেইল দিন এবং যাচাইয়ের সংকেতের নির্দেশনা অনুসরণ করুন। সংকেত বা পাসওয়ার্ড কারও সঙ্গে ভাগ করবেন না।",
    ],
    [
      "সরবরাহের সময় ও সহায়তার সময় কত?",
      "অনুমোদিত এলাকা ও সম্ভাব্য সময় সেবার এলাকা ও খরচ হিসাবের পাতায় দেখুন। নিষিদ্ধ পণ্য ও সহায়তার সময় বুকিংয়ের আগে ড্রপজোর সঙ্গে নিশ্চিত করুন।",
    ],
    [
      "সহায়তার জন্য কীভাবে যোগাযোগ করব?",
      `ইমেইল করুন ${legalOperator.contactEmail} ঠিকানায় অথবা ফোন করুন ${legalOperator.contactPhone} নম্বরে। যোগাযোগের পাতায় কার্যালয়ের ঠিকানা ও সহায়তার সময় পাবেন। এই সাইটে বার্তা পাঠানোর ফরম নেই।`,
    ],
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "bn"
        ? "সচরাচর প্রশ্ন | Dropzo"
        : "Frequently Asked Questions | Dropzo",
  };
}

export default function FaqPage() {
  const locale = useLocale();
  const ui = useUiText();
  return (
    <article className="page-wrap space-y-8">
      <h1 className="page-heading">{ui("FAQ")}</h1>
      {questions[locale === "bn" ? "bn" : "en"].map(([question, answer]) => (
        <section key={question} className="glass-panel space-y-3 p-6">
          <h2 className="text-xl font-semibold">{question}</h2>
          <p className="leading-8 text-muted-foreground">{answer}</p>
        </section>
      ))}
      <nav className="flex flex-wrap gap-5">
        <Link href="/track-shipment" className="underline">
          {ui("Shipment Tracking")}
        </Link>
        <Link href="/contact" className="underline">
          {ui("Contact")}
        </Link>
        <Link href="/terms" className="underline">
          {ui("Terms of Service")}
        </Link>
      </nav>
    </article>
  );
}
