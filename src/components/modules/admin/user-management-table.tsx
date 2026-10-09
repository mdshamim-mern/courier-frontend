"use client";
import { useState } from "react";
import {
  useGetAllUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/hooks";
import type { User } from "@/types";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";
import {
  AdminDialog,
  AdminFeedback,
  RefreshButton,
  TestRecordBadge,
  isTestRecord,
  useAdminText,
} from "./admin-ui";
import styles from "./admin.module.css";

export default function UserManagementTable() {
  const ui = useUiText(),
    display = useUiFormat(),
    t = useAdminText();
  const [page, setPage] = useState(1),
    [searchTerm, setSearchTerm] = useState("");
  const [viewing, setViewing] = useState<User | null>(null);
  const [change, setChange] = useState<{
    user: User;
    kind: "role" | "status";
    value: string;
  } | null>(null);
  const [success, setSuccess] = useState("");
  const result = useGetAllUsers({ page, limit: 10, searchTerm });
  const role = useUpdateUserRole(),
    status = useUpdateUserStatus();
  const busy = role.isPending || status.isPending;
  const choose = (user: User, kind: "role" | "status", value: string) => {
    role.reset();
    status.reset();
    setSuccess("");
    setChange({ user, kind, value });
  };
  const selected =
    result.data?.data.find((user) => user.id === viewing?.id) || viewing;
  return (
    <div className="space-y-4">
      <div className={styles.toolbar}>
        <Input
          aria-label={ui("Search users...")}
          placeholder={ui("Search users...")}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        <RefreshButton
          refresh={() => {
            void result.refetch();
          }}
          pending={result.isFetching}
        />
      </div>
      <p className={styles.note}>
        {t(
          "Checkout Verification and marked demo accounts are database test records, not hardcoded customers. Their original names and emails are retained.",
          "Checkout Verification এবং চিহ্নিত ডেমো অ্যাকাউন্টগুলো ডেটাবেসের পরীক্ষামূলক রেকর্ড, হার্ডকোড করা গ্রাহক নয়। মূল নাম–ইমেইল অপরিবর্তিত রাখা হয়েছে।",
        )}
      </p>
      <AdminFeedback success={success} />
      {result.isError ? (
        <>
          <AdminFeedback error={result.error} />
          <RefreshButton
            refresh={() => {
              void result.refetch();
            }}
          />
        </>
      ) : (
        <div className={styles.tablePanel}>
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Role", "Status", "Actions"].map((heading) => (
                  <TableHead key={heading}>{ui(heading)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.isPending ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles.empty}>
                    {t("Loading users…", "ব্যবহারকারী লোড হচ্ছে…")}
                  </TableCell>
                </TableRow>
              ) : !result.data?.data.length ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles.empty}>
                    {ui("No users found.")}
                  </TableCell>
                </TableRow>
              ) : (
                result.data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell data-label={ui("Name")}>
                      <div className={styles.identity}>
                        <strong>{user.name}</strong>
                        <span className={styles.secondary}>{user.email}</span>
                        {isTestRecord(user) && <TestRecordBadge />}
                      </div>
                    </TableCell>
                    <TableCell data-label={ui("Role")}>
                      <select
                        aria-label={t("Role for ", "ভূমিকা: ") + user.name}
                        value={user.role}
                        disabled={busy}
                        onChange={(e) => choose(user, "role", e.target.value)}
                        className="min-h-11 w-full rounded-xl border bg-transparent px-2"
                      >
                        {["CUSTOMER", "COURIER", "ADMIN"].map((value) => (
                          <option key={value} value={value}>
                            {ui(value)}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell data-label={ui("Status")}>
                      <span
                        className={[
                          styles.badge,
                          user.status === "ACTIVE"
                            ? styles.active
                            : styles.inactive,
                        ].join(" ")}
                      >
                        {ui(user.status)}
                      </span>
                      <p className={styles.secondary}>
                        {display.date(new Date(user.createdAt))}
                      </p>
                    </TableCell>
                    <TableCell data-label={ui("Actions")}>
                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewing(user)}
                        >
                          {ui("View")}
                        </Button>
                        <Button
                          variant={
                            user.status === "ACTIVE" ? "destructive" : "outline"
                          }
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            choose(
                              user,
                              "status",
                              user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
                            )
                          }
                        >
                          {ui(user.status === "ACTIVE" ? "Block" : "Unblock")}
                        </Button>
                      </div>
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
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={t("User details", "ব্যবহারকারীর বিস্তারিত")}
        description={t(
          "Original account information from the administrator user list.",
          "প্রশাসকের তালিকায় থাকা মূল অ্যাকাউন্টের তথ্য।",
        )}
      >
        {selected && (
          <>
            <dl className={styles.details}>
              {[
                [ui("Name"), selected.name],
                [ui("Email"), selected.email],
                [ui("Role"), ui(selected.role)],
                [ui("Status"), ui(selected.status)],
                [ui("Joined"), display.date(new Date(selected.createdAt))],
                [t("Phone", "ফোন"), selected.contactNumber || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {isTestRecord(selected) && <TestRecordBadge />}
          </>
        )}
      </AdminDialog>
      <AdminDialog
        open={!!change}
        onClose={() => {
          if (!busy) setChange(null);
        }}
        title={t("Confirm access change", "প্রবেশাধিকার পরিবর্তন নিশ্চিত করুন")}
        description={t(
          "Role and status changes affect account access. The server protects the last active administrator and validates courier assignment.",
          "ভূমিকা ও অবস্থা বদলালে প্রবেশাধিকার বদলাবে। সার্ভার শেষ সক্রিয় প্রশাসক এবং কর্মীর কাজ বরাদ্দ সুরক্ষিত রাখে।",
        )}
      >
        {change && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const options = {
                onSuccess: () => {
                  setChange(null);
                  setSuccess(
                    t(
                      "Access updated. The list has been refreshed.",
                      "প্রবেশাধিকার আপডেট হয়েছে। তালিকা আপডেট হয়েছে।",
                    ),
                  );
                },
              };
              if (change.kind === "role")
                role.mutate(
                  { id: change.user.id, payload: { role: change.value } },
                  options,
                );
              else
                status.mutate(
                  { id: change.user.id, payload: { status: change.value } },
                  options,
                );
            }}
          >
            <p className={styles.note}>
              {change.user.name} · {change.user.email}
              <br />
              {ui(
                change.kind === "role" ? change.user.role : change.user.status,
              )}{" "}
              → {ui(change.value)}
            </p>
            <label className="flex min-h-11 items-center gap-3">
              <input type="checkbox" required />
              {t(
                "I verified this account and approve this change.",
                "অ্যাকাউন্ট যাচাই করে এই পরিবর্তন অনুমোদন করছি।",
              )}
            </label>
            <AdminFeedback error={role.error || status.error} />
            <div className={styles.dialogActions}>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setChange(null)}
              >
                {t("Cancel", "বাতিল")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy
                  ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                  : t("Confirm change", "পরিবর্তন নিশ্চিত করুন")}
              </Button>
            </div>
          </form>
        )}
      </AdminDialog>
    </div>
  );
}
