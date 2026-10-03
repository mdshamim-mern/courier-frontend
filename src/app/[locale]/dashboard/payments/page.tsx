"use client";

import { useState } from "react";
import { useGetPayments } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TablePagination from "@/components/ui/table-pagination";
import { format } from "date-fns";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPayments({ page, limit: 10 });
  const payments = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-sm text-muted-foreground">
          View your transaction records and payment statuses.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.transactionId || "N/A"}</TableCell>
                  <TableCell>{format(new Date(payment.createdAt), "PP")}</TableCell>
                  <TableCell className="font-medium text-foreground">৳{payment.amount}</TableCell>
                  <TableCell>{payment.paymentGateway}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : payment.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <TablePagination page={page} totalPages={meta.totalPages} handlePageChange={setPage} />
      )}
    </div>
  );
}