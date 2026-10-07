"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useState, Suspense } from "react";
import { useGetAuditLogs } from "@/hooks";

function AuditLogsContent() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAuditLogs({ page, limit: 10 });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("System Audit Logs")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "View system-wide automated logs, tracking history, and payment events.",
          )}{" "}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Date & Time")}</TableHead>
                <TableHead>{ui("Action")}</TableHead>
                <TableHead>{ui("Entity Type")}</TableHead>
                <TableHead>{ui("Entity ID")}</TableHead>
                <TableHead>{ui("Details")}</TableHead>
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
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No logs found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {display.date(new Date(log.createdAt), true)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-muted">
                        {ui(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>{ui(log.entityType)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entityId}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-50 truncate">
                      {JSON.stringify(log.details)}
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
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <AuditLogsContent />
    </Suspense>
  );
}
