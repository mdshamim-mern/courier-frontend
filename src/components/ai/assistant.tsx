"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useGetMe } from "@/hooks";
import { Link } from "@/i18n/navigation";
export default function Assistant({
  mode = "support",
}: {
  mode?: "support" | "insights";
}) {
  const locale = useLocale(),
    bn = locale === "bn",
    t = (en: string, bangla: string) => (bn ? bangla : en);
  const { data, isLoading } = useGetMe();
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="glass-panel space-y-5 p-6 sm:p-8">
      <p className="eyebrow">Gemini AI</p>
      <h2 className="text-2xl font-bold">
        {mode === "support"
          ? t("Delivery support assistant", "ডেলিভারি সহায়ক")
          : t("Delivery insights", "ডেলিভারির বিশ্লেষণ")}
      </h2>
      <p className="text-muted-foreground">
        {mode === "support"
          ? t(
              "Ask about booking, tracking and delivery fees. Your question is sent to Google Gemini; leave out personal details.",
              "বুকিং, অনুসরণ ও মাশুল নিয়ে প্রশ্ন করুন। প্রশ্ন Google Gemini-তে পাঠানো হয়; ব্যক্তিগত তথ্য দেবেন না।",
            )
          : t(
              "Generate suggestions from your current shipment status totals. Only aggregate counts are sent to Google Gemini.",
              "বর্তমান পার্সেলের অবস্থার মোট সংখ্যা থেকে পরামর্শ নিন। শুধু সামগ্রিক সংখ্যা Google Gemini-তে পাঠানো হয়।",
            )}
      </p>
      {!isLoading && !data?.data ? (
        <Link href="/login?next=/assistant" className="brand-button">
          {t("Sign in to use AI", "AI ব্যবহারে প্রবেশ করুন")}
        </Link>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setAnswer("");
            try {
              const response = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, locale, question }),
                signal: AbortSignal.timeout(45000),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message);
              setAnswer(result.answer);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : t("Please try again.", "আবার চেষ্টা করুন।"),
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {mode === "support" && (
            <label className="block">
              {t("Your question", "আপনার প্রশ্ন")}
              <textarea
                required
                maxLength={1500}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-2 min-h-28 w-full rounded-xl border bg-background p-3"
              />
            </label>
          )}
          <button
            type="submit"
            className="brand-button"
            disabled={busy || isLoading}
          >
            {busy
              ? t("Thinking…", "উত্তর তৈরি হচ্ছে…")
              : mode === "support"
                ? t("Ask assistant", "প্রশ্ন করুন")
                : t("Generate insights", "বিশ্লেষণ করুন")}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {answer && (
        <div
          role="status"
          className="whitespace-pre-wrap rounded-xl border bg-background p-5"
        >
          {answer}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {t(
          "AI suggestions can be inaccurate. Verify charges and availability on the booking page.",
          "AI পরামর্শে ভুল থাকতে পারে। বুকিং পাতায় মাশুল ও প্রাপ্যতা যাচাই করুন।",
        )}
      </p>
    </section>
  );
}
