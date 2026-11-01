"use client";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import type { Collection, OperationsMine } from "@/types/operations.type";
import { useUrlState } from "@/hooks/use-url-state";
import TablePagination from "@/components/ui/table-pagination";
export default function CollectionTable({
  records,
  totals,
  action,
}: {
  records: Collection[];
  totals?: OperationsMine["totals"];
  action?: ReactNode;
}) {
  const bn = useLocale() === "bn",
    money = (value: string) =>
      new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", {
        style: "currency",
        currency: "BDT",
      }).format(Number(value));
  const captions: Record<string, string> = {
    COLLECTED: bn ? "কর্মীর কাছে সংগৃহীত" : "Collected by worker",
    RECEIVED: bn ? "প্রতিষ্ঠান গ্রহণ করেছে" : "Received by operator",
    PAID: bn ? "ব্যবসায়ীকে দেওয়া হয়েছে" : "Paid to merchant",
  };
  const [search, setSearch] = useUrlState("search", "");
  const [status, setStatus] = useUrlState("status", "");
  const [page, setPage] = useUrlState("page", 1);
  const filtered = records.filter(
    (r) =>
      (!status || r.status === status) &&
      `${r.shipmentId} ${r.receiptReference || ""} ${r.payoutReference || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  return (
    <section className="space-y-4">
      <div className="ledger-heading">
        <h2 className="text-2xl font-bold">
          {bn ? "পণ্যের টাকা সংগ্রহের হিসাব" : "Product cash collection ledger"}
        </h2>
        {action}
      </div>
      <p className="text-sm">
        {bn
          ? "ডেলিভারি মাশুলের অনলাইন অর্থপ্রদান এই হিসাবের অংশ নয়। এখানে প্রাপকের কাছ থেকে সংগৃহীত পণ্যের টাকা দেখানো হয়।"
          : "Online delivery-fee payments are separate. This ledger tracks product cash collected from the receiver."}
      </p>
      {totals && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["expected", "Booked product COD", "বুকিংয়ে সংগ্রহযোগ্য পণ্যের টাকা"],
              [
                "collected",
                "Collected from recipients",
                "প্রাপকদের কাছ থেকে সংগৃহীত",
              ],
              ["awaitingCollection", "Not yet collected", "এখনো সংগ্রহ হয়নি"],
              ["heldByWorker", "Cash held by workers", "কর্মীদের কাছে নগদ"],
              ["payable", "Net merchant payable", "মোট ব্যবসায়ীর নিট পাওনা"],
              ["paid", "Paid to merchants", "ব্যবসায়ীকে দেওয়া হয়েছে"],
              ["pending", "Remaining payable", "ব্যবসায়ীর বাকি পাওনা"],
            ] as const
          ).map(([key, en, bangla]) => (
            <div
              key={key}
              className="customer-cash-metric rounded-md border p-3"
            >
              <p>{bn ? bangla : en}</p>
              <strong>{money(totals[key])}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          {bn ? "হিসাব খুঁজুন" : "Search collections"}
          <input
            type="search"
            className="mt-2 h-12 w-full rounded-xl border bg-background px-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          {bn ? "অবস্থা" : "Status"}
          <select
            className="mt-2 h-12 w-full rounded-xl border bg-background px-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{bn ? "সব" : "All"}</option>
            {Object.entries(captions).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!filtered.length && (
        <p>
          {bn ? "এখনো কোনো সংগ্রহের হিসাব নেই।" : "No cash collections recorded."}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered
          .slice((currentPage - 1) * 10, currentPage * 10)
          .map((record) => (
            <article
              key={record.id}
              className="space-y-2 rounded-xl border p-4"
            >
              <p className="break-all text-sm">
                {bn ? "পার্সেল: " : "Shipment: "}
                {record.shipmentId}
              </p>
              <p>
                {bn ? "সংগৃহীত: " : "Collected: "}
                {money(record.amount)}
              </p>
              <p>
                {bn ? "সংগ্রহের মাশুল: " : "Handling fee: "}
                {money(record.fee)}
              </p>
              <p>
                {bn ? "ব্যবসায়ীর পাওনা: " : "Merchant payable: "}
                {money(record.payable)}
              </p>
              <p>{captions[record.status] || record.status}</p>
              {record.createdAt && (
                <p>
                  {bn ? "সংগ্রহের সময়: " : "Collection time: "}
                  {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(record.createdAt))}
                </p>
              )}
              {record.receiptReference && (
                <p>
                  {bn ? "গ্রহণের রসিদ: " : "Cash receipt: "}
                  {record.receiptReference}
                </p>
              )}
              {record.payoutReference && (
                <p>
                  {bn ? "টাকা দেওয়ার প্রমাণ: " : "Payout reference: "}
                  {record.payoutReference}
                </p>
              )}
            </article>
          ))}
      </div>
      <TablePagination
        page={currentPage}
        totalPages={totalPages}
        handlePageChange={setPage}
      />
      {records.length >= 200 && (
        <p>
          {bn
            ? "সাম্প্রতিক ২০০টি হিসাব দেখানো হচ্ছে।"
            : "Showing the latest 200 records."}
        </p>
      )}
    </section>
  );
}
