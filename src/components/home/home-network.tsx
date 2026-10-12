"use client";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { MapPin, PackageCheck, Truck, Navigation } from "lucide-react";
import { usePublicCoverage } from "@/hooks/use-public-coverage";
import PublicDataState from "@/components/operations/public-data-state";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { placeName } from "@/i18n/geography";
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { Quote } from "@/types/operations.type";

export function HomeNetworkStats() {
  const locale = useLocale(),
    bn = locale === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const coverage = usePublicCoverage();
  const areas = coverage.data?.data || [];
  const districts = new Set(
    areas.map((a) => a.district.trim().toLowerCase()).filter(Boolean),
  );
  return (
    <section
      className="home-network-section"
      aria-labelledby="home-network-title"
    >
      <div className="home-section-heading">
        <div>
          <span className="eyebrow">
            {t("CURRENT SERVICE NETWORK", "বর্তমান সেবার নেটওয়ার্ক")}
          </span>
          <h2 id="home-network-title">
            {t(
              "Real coverage. Clear expectations.",
              "আসল সেবার এলাকা। সুস্পষ্ট তথ্য।",
            )}
          </h2>
          <p>
            {t(
              "Counts from the current coverage configuration—not delivery-volume or performance claims.",
              "বর্তমান সেবার এলাকার তথ্য থেকে গণনা; ডেলিভারির পরিমাণ বা সফলতার দাবি নয়।",
            )}
          </p>
        </div>
        <Link className="text-link" href="/coverage">
          {t("View coverage", "সেবার এলাকা দেখুন")}
        </Link>
      </div>
      {coverage.isPending || coverage.isError ? (
        <PublicDataState
          pending={coverage.isPending}
          retry={() => {
            void coverage.refetch();
          }}
        />
      ) : (
        <div className="home-network-grid">
          {[
            {
              Icon: MapPin,
              label: t("Districts in coverage", "সেবার আওতায় জেলা"),
              value: districts.size,
            },
            {
              Icon: PackageCheck,
              label: t("Service areas", "সেবার এলাকা"),
              value: areas.length,
            },
            {
              Icon: Truck,
              label: t("Pickup areas", "সংগ্রহের এলাকা"),
              value: areas.filter((a) => a.pickupEnabled).length,
            },
            {
              Icon: Navigation,
              label: t("Delivery areas", "পৌঁছানোর এলাকা"),
              value: areas.filter((a) => a.deliveryEnabled).length,
            },
          ].map(({ Icon, label, value }) => (
            <article key={label} className="glass-panel home-network-card">
              <Icon size={22} aria-hidden="true" />
              <strong>
                {new Intl.NumberFormat(bn ? "bn-BD" : "en-BD").format(value)}
              </strong>
              <p>{label}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function HomePricingExample() {
  const locale = useLocale(),
    bn = locale === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const coverage = usePublicCoverage();
  const areas = coverage.data?.data || [];
  const pickup =
    areas.find(
      (a) => a.pickupEnabled && a.name.toLowerCase() === "dhanmondi",
    ) || areas.find((a) => a.pickupEnabled);
  const delivery =
    areas.find(
      (a) =>
        a.deliveryEnabled &&
        a.name.toLowerCase() === "mirpur" &&
        a.district === pickup?.district,
    ) ||
    areas.find((a) => a.deliveryEnabled && a.district === pickup?.district) ||
    areas.find((a) => a.deliveryEnabled);
  const quote = useQuery({
    queryKey: ["home-quote-example", pickup?.id, delivery?.id],
    enabled: !!pickup && !!delivery,
    queryFn: async () => {
      if (!pickup || !delivery) throw new Error("No approved example route");
      const response = await apiClient<ApiResponse<Quote>>(
          "/operations/quote",
          {
            method: "POST",
            timeout: 15000,
            body: {
              pickupAreaId: pickup.id,
              receiverAreaId: delivery.id,
              weight: 1,
              codAmount: 0,
              serviceType: "STANDARD",
              pickupMode: "HOME",
            },
          },
        ),
        amount = Number(response.data?.deliveryCharge);
      if (
        response.data?.deliveryCharge == null ||
        !Number.isFinite(amount) ||
        amount < 0
      )
        throw new Error("Approved quote unavailable");
      return response;
    },
    retry: false,
    staleTime: 60000,
  });
  return (
    <aside
      className="glass-panel home-price-example"
      aria-labelledby="home-price-example-title"
    >
      <div>
        <span className="eyebrow">
          {t("LIVE PRICING EXAMPLE", "বর্তমান মাশুলের উদাহরণ")}
        </span>
        <h3 id="home-price-example-title">
          {t("A small parcel, a clear estimate", "ছোট পার্সেল, সুস্পষ্ট হিসাব")}
        </h3>
        <p className="tool-caption">
          {t(
            "1 kg · Standard · Home pickup · Product COD 0",
            "১ কেজি · সাধারণ সেবা · ঠিকানা থেকে সংগ্রহ · পণ্যের টাকা সংগ্রহ ০",
          )}
        </p>
      </div>
      {coverage.isPending || coverage.isError ? (
        <PublicDataState
          pending={coverage.isPending}
          retry={() => {
            void coverage.refetch();
          }}
        />
      ) : !pickup || !delivery ? (
        <p role="status" className="tool-caption">
          {t(
            "No approved example route is available yet.",
            "এখনো উদাহরণের অনুমোদিত পথ পাওয়া যায়নি।",
          )}
        </p>
      ) : quote.isPending ? (
        <PublicDataState
          pending
          retry={() => {
            void quote.refetch();
          }}
        />
      ) : quote.isError ? (
        <div role="alert">
          <p className="tool-caption">
            {t(
              "This route's approved example charge is unavailable. Try again or calculate another route; no fixed price is substituted.",
              "এই পথের অনুমোদিত মাশুল পাওয়া যায়নি। আবার চেষ্টা করুন বা অন্য পথ হিসাব করুন; অনুমানভিত্তিক দাম দেখানো হবে না।",
            )}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              void quote.refetch();
            }}
          >
            {t("Retry example", "উদাহরণ আবার দেখুন")}
          </Button>
        </div>
      ) : (
        <div className="home-example-amount">
          <p>
            {placeName(pickup.name, locale)} →{" "}
            {placeName(delivery.name, locale)}
          </p>
          <strong>
            {new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
              style: "currency",
              currency: "BDT",
            }).format(Number(quote.data?.data.deliveryCharge))}
          </strong>
          <p className="tool-caption">
            {t(
              "Current server quote. Final charges are recalculated when booking; this does not create a parcel or payment.",
              "বর্তমান সার্ভারের হিসাব। বুকিংয়ের সময় আবার মাশুল যাচাই হবে; এখানে পার্সেল বা অর্থপ্রদান তৈরি হয় না।",
            )}
          </p>
        </div>
      )}
    </aside>
  );
}
