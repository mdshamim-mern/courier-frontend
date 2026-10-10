"use client";

import type { DashboardStats } from "@/types";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { useLocale } from "next-intl";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";

export default function AnalyticsCharts({ stats }: { stats: DashboardStats }) {
  const bn = useLocale() === "bn",
    ui = useUiText(),
    display = useUiFormat();
  const rows = stats.shipmentsByStatus.map((row) => ({
    label: ui(row.status.replaceAll("_", " ")),
    count: row._count.status,
  }));
  const maximum = Math.max(1, ...rows.map((row) => row.count));
  const months = stats.monthlyRevenue || [];
  const maximumRevenue = Math.max(1, ...months.map((row) => row.amount));
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="glass-panel min-w-0 space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold">
          {bn ? "পার্সেলের অবস্থার বিশ্লেষণ" : "Shipment status distribution"}
        </h2>
        {!rows.length ? (
          <EmptyStatePanel
            title={bn ? "কোনো পার্সেল নেই" : "No shipments recorded"}
          />
        ) : (
          <div
            role="img"
            aria-label={rows
              .map((row) => `${row.label}: ${row.count}`)
              .join(", ")}
            className="space-y-4"
          >
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span>{row.label}</span>
                  <span>{display.number(row.count)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-primary/8">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-purple-400"
                    style={{ width: `${(row.count / maximum) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
      <article className="glass-panel min-w-0 space-y-5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold">
          {bn ? "ছয় মাসের নিশ্চিত মাশুলের আয়" : "Confirmed revenue · last 6 months"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {bn
            ? "PAID ডেলিভারি মাশুল, মাস Asia/Dhaka সময়ে। পণ্যের নগদ টাকা নয়।"
            : "PAID delivery fees by month in Asia/Dhaka. Excludes product COD."}
        </p>
        {!months.length ? (
          <EmptyStatePanel
            title={bn ? "আয়ের তথ্য পাওয়া যায়নি" : "Revenue series unavailable"}
          />
        ) : (
          <>
            <svg
              role="img"
              aria-label={months
                .map((row) => `${row.month}: BDT ${row.amount}`)
                .join(", ")}
              viewBox="0 0 420 220"
              className="w-full overflow-visible"
            >
              <line
                x1="10"
                y1="180"
                x2="410"
                y2="180"
                stroke="currentColor"
                opacity="0.2"
              />
              {months.map((row, index) => (
                <g key={row.month}>
                  <rect
                    x={20 + index * 66}
                    y={180 - (row.amount / maximumRevenue) * 135}
                    width="38"
                    height={(row.amount / maximumRevenue) * 135}
                    rx="6"
                    fill="var(--primary)"
                    opacity={0.6 + index * 0.07}
                  >
                    <title>
                      {row.month}: BDT {display.money(row.amount)}
                    </title>
                  </rect>
                  <text
                    x={39 + index * 66}
                    y="205"
                    textAnchor="middle"
                    fontSize="12"
                    fill="currentColor"
                  >
                    {row.month.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
            <details className="text-sm">
              <summary className="cursor-pointer text-primary">
                {bn ? "হিসাবের তালিকা দেখুন" : "View accessible data table"}
              </summary>
              <table className="mt-3 w-full">
                <thead>
                  <tr>
                    <th scope="col">{bn ? "মাস" : "Month"}</th>
                    <th scope="col">BDT</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((row) => (
                    <tr key={row.month}>
                      <th scope="row">{row.month}</th>
                      <td>{display.money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </article>
    </section>
  );
}
