"use client";
import { useUrlState } from "@/hooks/use-url-state";
import { useState } from "react";
import { useGetAuditLogs } from "@/hooks";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import type { AuditLog } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import {
  AdminDialog,
  AdminFeedback,
  AdminPageHeader,
  RefreshButton,
  useAdminText,
} from "@/components/modules/admin/admin-ui";
import DataSkeleton from "@/components/ui/data-skeleton";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import styles from "@/components/modules/admin/admin.module.css";
export default function AuditLogsPage() {
  const ui = useUiText(),
    display = useUiFormat(),
    t = useAdminText();
  const [page, setPage] = useUrlState("page", 1),
    [selected, setSelected] = useState<AuditLog | null>(null);
  const result = useGetAuditLogs({ page, limit: 10 });
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ui("System Audit Logs")}
        description={ui(
          "View system-wide automated logs, tracking history, and payment events.",
        )}
        action={
          <RefreshButton
            refresh={() => {
              void result.refetch();
            }}
            pending={result.isFetching}
          />
        }
      />
      {result.isError ? (
        <AdminFeedback error={result.error} />
      ) : (
        <div className={styles.tablePanel}>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Date & Time",
                  "Action",
                  "Entity Type",
                  "Entity ID",
                  "Details",
                ].map((label) => (
                  <TableHead key={label}>{ui(label)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.isPending ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.empty}>
                    <DataSkeleton />
                  </TableCell>
                </TableRow>
              ) : !result.data?.data.length ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.empty}>
                    <EmptyStatePanel title={ui("No logs found.")} />
                  </TableCell>
                </TableRow>
              ) : (
                result.data.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell data-label={ui("Date & Time")}>
                      {display.date(new Date(log.createdAt), true)}
                    </TableCell>
                    <TableCell data-label={ui("Action")}>
                      <span className={styles.badge}>{ui(log.action)}</span>
                    </TableCell>
                    <TableCell data-label={ui("Entity Type")}>
                      {ui(log.entityType)}
                    </TableCell>
                    <TableCell
                      data-label={ui("Entity ID")}
                      className={styles.secondary}
                    >
                      {log.entityId}
                    </TableCell>
                    <TableCell data-label={ui("Details")}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(log)}
                      >
                        {ui("View")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {result.data?.meta && result.data.meta.totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={result.data.meta.totalPages}
          handlePageChange={setPage}
        />
      )}
      <AdminDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={t("Audit event details", "ঘটনার বিস্তারিত")}
        description={t(
          "Read-only server event. Raw identifiers and details are preserved.",
          "সার্ভারে নথিভুক্ত ঘটনা। মূল পরিচিতি ও বিস্তারিত অপরিবর্তিত।",
        )}
      >
        {selected && (
          <>
            <dl className={styles.details}>
              <div>
                <dt>{ui("Action")}</dt>
                <dd>{ui(selected.action)}</dd>
              </div>
              <div>
                <dt>{ui("Entity ID")}</dt>
                <dd>{selected.entityId}</dd>
              </div>
            </dl>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-xl border bg-white/70 p-4 text-xs">
              {JSON.stringify(selected.details, null, 2)}
            </pre>
          </>
        )}
      </AdminDialog>
    </div>
  );
}
