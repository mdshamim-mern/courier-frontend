"use client";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { placeName, hubAddress } from "@/i18n/geography";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import {
  useCreateHub,
  useDeleteHub,
  useGetAllHubs,
  useGetSingleHub,
  useUpdateHub,
} from "@/hooks";
import type { Hub } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import styles from "@/components/modules/admin/admin.module.css";

export default function HubsManagementPage() {
  const locale = useLocale(),
    ui = useUiText(),
    display = useUiFormat(),
    t = useAdminText();
  const [page, setPage] = useState(1),
    [searchTerm, setSearchTerm] = useState("");
  const [selection, setSelection] = useState<{
    mode: "create" | "view" | "edit" | "delete";
    hub?: Hub;
  } | null>(null);
  const [success, setSuccess] = useState("");
  const result = useGetAllHubs({ page, limit: 10, searchTerm });
  const detail = useGetSingleHub(
    selection?.mode === "view" ? selection.hub?.id || "" : "",
  );
  const create = useCreateHub(),
    update = useUpdateHub(),
    remove = useDeleteHub();
  const busy = create.isPending || update.isPending || remove.isPending;
  const error = create.error || update.error || remove.error;
  const hubs = result.data?.data || [];
  const close = () => {
    if (!busy) setSelection(null);
  };
  const open = (mode: "create" | "view" | "edit" | "delete", hub?: Hub) => {
    create.reset();
    update.reset();
    remove.reset();
    setSuccess("");
    setSelection({ mode, hub });
  };
  const saved = () => {
    setSuccess(
      t(
        "Hub saved. The list has been refreshed.",
        "হাব সংরক্ষিত। তালিকা আপডেট হয়েছে।",
      ),
    );
    setSelection(null);
  };
  const selected = detail.data?.data || selection?.hub;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ui("Hub Management")}
        description={ui(
          "Manage origin and destination hubs for routing shipments.",
        )}
        action={
          <Button onClick={() => open("create")}>
            <Plus size={17} aria-hidden="true" />
            {ui("Add Hub")}
          </Button>
        }
      />
      <div className={styles.toolbar}>
        <Input
          aria-label={ui("Search hubs...")}
          placeholder={ui("Search hubs...")}
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
                {["Hub Name", "Location", "Detailed Address", "Actions"].map(
                  (heading) => (
                    <TableHead key={heading}>{ui(heading)}</TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.isPending ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles.empty}>
                    {t("Loading hubs…", "হাব লোড হচ্ছে…")}
                  </TableCell>
                </TableRow>
              ) : !hubs.length ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles.empty}>
                    {ui("No hubs found.")}
                  </TableCell>
                </TableRow>
              ) : (
                hubs.map((hub) => (
                  <TableRow key={hub.id}>
                    <TableCell data-label={ui("Hub Name")}>
                      <div className={styles.identity}>
                        <strong className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="mt-1 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {placeName(hub.name, locale)}
                        </strong>
                        <span className={styles.secondary}>
                          {display.date(new Date(hub.createdAt))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-label={ui("Location")}>
                      {placeName(hub.location, locale)}
                    </TableCell>
                    <TableCell data-label={ui("Detailed Address")}>
                      {hubAddress(hub.address, locale)}
                    </TableCell>
                    <TableCell data-label={ui("Actions")}>
                      <div className={styles.actions}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => open("view", hub)}
                        >
                          {ui("View")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => open("edit", hub)}
                        >
                          {ui("Edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => open("delete", hub)}
                        >
                          {ui("Delete")}
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
        open={!!selection}
        onClose={close}
        title={
          selection?.mode === "create"
            ? ui("Add Hub")
            : selection?.mode === "edit"
              ? t("Edit hub", "হাব সম্পাদনা")
              : selection?.mode === "delete"
                ? t("Delete hub", "হাব মুছুন")
                : t("Hub details", "হাবের বিস্তারিত")
        }
        description={
          selection?.mode === "delete"
            ? t(
                "Only unused hubs can be archived. Existing parcel history is retained.",
                "শুধু অব্যবহৃত হাব আর্কাইভ করা যাবে। পার্সেলের ইতিহাস থাকবে।",
              )
            : t(
                "Hub information is read from the database. Changes require administrator access.",
                "হাবের তথ্য ডেটাবেস থেকে আসে। পরিবর্তনে প্রশাসকের অনুমতি প্রয়োজন।",
              )
        }
      >
        {selection?.mode === "view" &&
          (detail.isPending ? (
            <p>{t("Loading details…", "বিস্তারিত লোড হচ্ছে…")}</p>
          ) : detail.isError ? (
            <>
              <AdminFeedback error={detail.error} />
              <RefreshButton
                refresh={() => {
                  void detail.refetch();
                }}
              />
            </>
          ) : (
            selected && (
              <dl className={styles.details}>
                {[
                  [ui("Hub Name"), placeName(selected.name, locale)],
                  [ui("Location"), placeName(selected.location, locale)],
                  [
                    ui("Detailed Address"),
                    hubAddress(selected.address, locale),
                  ],
                  [
                    ui("Created At"),
                    display.date(new Date(selected.createdAt)),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )
          ))}
        {(selection?.mode === "create" || selection?.mode === "edit") && (
          <form
            key={selection.hub?.id || "new-hub"}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget),
                payload = {
                  name: String(data.get("name")).trim(),
                  location: String(data.get("location")).trim(),
                  address: String(data.get("address")).trim(),
                };
              if (selection.hub)
                update.mutate(
                  { id: selection.hub.id, payload },
                  { onSuccess: saved },
                );
              else create.mutate(payload, { onSuccess: saved });
            }}
          >
            <div className={styles.formGrid}>
              <label>
                {ui("Hub Name")}
                <input
                  name="name"
                  required
                  maxLength={120}
                  defaultValue={
                    selection.hub ? placeName(selection.hub.name, locale) : ""
                  }
                />
              </label>
              <label>
                {ui("Location")}
                <input
                  name="location"
                  required
                  maxLength={120}
                  defaultValue={
                    selection.hub
                      ? placeName(selection.hub.location, locale)
                      : ""
                  }
                />
              </label>
              <label className={styles.full}>
                {ui("Detailed Address")}
                <textarea
                  name="address"
                  aria-label={ui("Detailed Address")}
                  required
                  maxLength={500}
                  rows={3}
                  defaultValue={
                    selection.hub
                      ? hubAddress(selection.hub.address, locale)
                      : ""
                  }
                />
              </label>
            </div>
            <AdminFeedback error={error} />
            <div className={styles.dialogActions}>
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={busy}
              >
                {t("Cancel", "বাতিল")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy
                  ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                  : t("Save hub", "হাব সংরক্ষণ")}
              </Button>
            </div>
          </form>
        )}
        {selection?.mode === "delete" && selection.hub && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selection.hub) return;
              remove.mutate(selection.hub.id, {
                onSuccess: () => {
                  setSelection(null);
                  setSuccess(
                    t("Unused hub archived.", "অব্যবহৃত হাব আর্কাইভ করা হয়েছে।"),
                  );
                },
              });
            }}
          >
            <p className={styles.note}>
              {placeName(selection.hub.name, locale)} ·{" "}
              {hubAddress(selection.hub.address, locale)}
            </p>
            <label className="flex min-h-11 items-center gap-3">
              <input name="confirmed" type="checkbox" required />
              {t("I confirm deletion of this hub.", "এই হাব মুছতে সম্মতি দিচ্ছি।")}
            </label>
            <AdminFeedback error={error} />
            <div className={styles.dialogActions}>
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={busy}
              >
                {t("Cancel", "বাতিল")}
              </Button>
              <Button type="submit" variant="destructive" disabled={busy}>
                {busy
                  ? t("Deleting…", "মুছে ফেলা হচ্ছে…")
                  : t("Confirm deletion", "মুছতে নিশ্চিত করুন")}
              </Button>
            </div>
          </form>
        )}
      </AdminDialog>
    </div>
  );
}
