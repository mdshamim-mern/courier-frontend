"use client";
import { useUrlState } from "@/hooks/use-url-state";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import QueryError from "@/components/ui/query-error";
import { useGetPayments } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table-pagination";
import { useLocale } from "next-intl";
import { CreditCard, CircleCheck, Clock3 } from "lucide-react";
import CourierRefresh from "@/components/modules/courier/courier-refresh";

export default function PaymentsPage() {
  const ui = useUiText();
  const bn = useLocale() === "bn";
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const display = useUiFormat();
  const [page, setPage] = useUrlState("page", 1);
  const { data, isLoading, isFetching, isError, refetch } = useGetPayments({
    page,
    limit: 10,
  });
  const payments = data?.data || [];
  const meta = data?.meta;

  if (isError)
    return (
      <QueryError
        retry={() => {
          void refetch();
        }}
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("Payment History")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui("View your transaction records and payment statuses.")}{" "}
        </p>
      </div>

      <section
        className="payment-page-summary"
        aria-label={t(
          "Current page payment summary",
          "এই পাতার অর্থপ্রদানের সংক্ষিপ্ত হিসাব",
        )}
      >
        {[
          {
            Icon: CreditCard,
            label: t("Records on this page", "এই পাতার লেনদেন"),
            value: display.number(payments.length),
          },
          {
            Icon: CircleCheck,
            label: t("Paid records on this page", "এই পাতায় পরিশোধিত"),
            value: display.number(
              payments.filter((p) => p.status === "PAID").length,
            ),
          },
          {
            Icon: Clock3,
            label: t("Unpaid / failed on this page", "এই পাতায় অপরিশোধিত / ব্যর্থ"),
            value: display.number(
              payments.filter(
                (p) => p.status === "UNPAID" || p.status === "FAILED",
              ).length,
            ),
          },
        ].map(({ Icon, label, value }) => (
          <article key={label} className="glass-panel payment-summary-card">
            <Icon size={21} aria-hidden="true" />
            <p>{label}</p>
            <strong>{isLoading ? "—" : value}</strong>
          </article>
        ))}
      </section>

      <div className="customer-table rounded-md border bg-card">
        <div className="payment-ledger-heading">
          <div>
            <h2>{t("Transaction ledger", "লেনদেনের হিসাব")}</h2>
            <p>
              {t(
                "Server-recorded delivery-fee payments. Product COD is tracked separately.",
                "সার্ভারে নথিভুক্ত ডেলিভারি মাশুলের অর্থপ্রদান। পণ্যের টাকা সংগ্রহ আলাদা হিসাবে থাকে।",
              )}
            </p>
          </div>
          <CourierRefresh
            label={t("Refresh payments", "অর্থপ্রদান হালনাগাদ করুন")}
            fetching={isFetching}
            refresh={async () => {
              await refetch({ throwOnError: true });
            }}
          />
        </div>
        <Table className="customer-payment-table">
          <TableHeader>
            <TableRow>
              <TableHead>{ui("Transaction ID")}</TableHead>
              <TableHead>{ui("Date")}</TableHead>
              <TableHead>{ui("Amount")}</TableHead>
              <TableHead>{ui("Gateway")}</TableHead>
              <TableHead>{ui("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [
                "placeholder-a",
                "placeholder-b",
                "placeholder-c",
                "placeholder-d",
                "placeholder-e",
              ].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {ui("No payment records found.")}{" "}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell
                    data-label={ui("Transaction ID")}
                    className="font-mono text-xs"
                  >
                    {payment.transactionId || ui("N/A")}
                  </TableCell>
                  <TableCell data-label={ui("Date")}>
                    {display.date(new Date(payment.createdAt))}
                  </TableCell>
                  <TableCell
                    data-label={ui("Amount")}
                    className="font-medium text-foreground"
                  >
                    ৳{display.money(payment.amount)}
                  </TableCell>
                  <TableCell data-label={ui("Gateway")}>
                    <span className="payment-gateway">
                      {ui(payment.paymentGateway)}
                    </span>
                  </TableCell>
                  <TableCell data-label={ui("Status")}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : payment.status === "FAILED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                    >
                      {ui(payment.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={meta.totalPages}
          handlePageChange={setPage}
        />
      )}
    </div>
  );
}
