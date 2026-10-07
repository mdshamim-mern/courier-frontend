"use client";

import { useLocale } from "next-intl";
import { Button } from "./button";

export default function QueryError({ retry }: { retry: () => void }) {
  const bn = useLocale() === "bn";
  return <div role="alert" className="rounded-xl border p-6 text-center space-y-3">
    <p>{bn ? "তথ্য আনা যায়নি। আবার চেষ্টা করুন।" : "Unable to load this information. Please try again."}</p>
    <Button variant="outline" onClick={retry}>{bn ? "আবার চেষ্টা করুন" : "Try again"}</Button>
  </div>;
}
