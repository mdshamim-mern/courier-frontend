import type { Metadata } from "next";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUiText } from "@/i18n/use-ui-text";
import { legalOperator } from "@/content/legal";
import { ArrowUpRight, CircleHelp, MessageCircleMore } from "lucide-react";

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
  const bengali = locale === "bn";
  return (
    <article className="page-wrap space-y-8 sm:space-y-10">
      <header className="faq-hero glass-panel p-6 text-center sm:p-10 lg:p-12">
        <span className="icon-tile mx-auto">
          <CircleHelp className="size-6" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-5">{bengali ? "সহায়তা কেন্দ্র" : "Help Center"}</p>
        <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
          {ui("FAQ")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground sm:text-lg">
          {bengali
            ? "পার্সেল, পেমেন্ট ও সহায়তা নিয়ে দরকারি উত্তরগুলো এক জায়গায় পান।"
            : "Quick, clear answers about parcels, payments, and getting help from Dropzo."}
        </p>
      </header>

      <div className="grid gap-3">
        {questions[bengali ? "bn" : "en"].map(([question, answer], index) => (
          <details key={question} className="glass-panel faq-item group p-0">
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="flex-1 text-left text-lg font-bold tracking-[-0.02em] sm:text-xl">
                {question}
              </h2>
              <span
                className="faq-plus text-2xl leading-none text-primary"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <div className="border-t border-border px-5 pb-6 pt-5 sm:px-6">
              <p className="pl-12 leading-8 text-muted-foreground">{answer}</p>
            </div>
          </details>
        ))}
      </div>

      <aside className="glass-panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-4">
          <span className="icon-tile">
            <MessageCircleMore aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold">
              {bengali ? "আরও সাহায্য লাগবে?" : "Need a little more help?"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {bengali
                ? "আমাদের support team-এর সঙ্গে সরাসরি যোগাযোগ করুন।"
                : "Reach our support team directly for assistance."}
            </p>
          </div>
        </div>
        <Link href="/contact" className="brand-button shrink-0">
          {ui("Contact")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </aside>
    </article>
  );
}
