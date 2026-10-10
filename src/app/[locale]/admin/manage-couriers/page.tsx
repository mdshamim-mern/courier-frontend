"use client";
import { useUrlState } from "@/hooks/use-url-state";
import {
  CourierSchema,
  CourierEditSchema,
} from "@/validation/operations.validation";
import { SchemaForm } from "@/components/form/schema-form";
import { useState } from "react";
import { useLocale } from "next-intl";
import { Plus, Truck } from "lucide-react";
import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { placeName } from "@/i18n/geography";
import { Link } from "@/i18n/navigation";
import {
  useCreateCourier,
  useGetAllCouriers,
  useGetAllHubs,
  useGetCourierDetails,
  useGetCourierHistoryAndEarnings,
  useUpdateCourierProfile,
} from "@/hooks";
import type { Courier } from "@/types";
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
  TestRecordBadge,
  isTestRecord,
  useAdminText,
} from "@/components/modules/admin/admin-ui";
import DataSkeleton from "@/components/ui/data-skeleton";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import styles from "@/components/modules/admin/admin.module.css";

export default function ManageCouriersPage() {
  const locale = useLocale(),
    ui = useUiText(),
    display = useUiFormat(),
    t = useAdminText();
  const [page, setPage] = useUrlState("page", 1),
    [searchTerm, setSearchTerm] = useUrlState("search", "");
  const [selection, setSelection] = useState<{
    mode: "view" | "edit" | "create";
    courier?: Courier;
  } | null>(null);
  const [success, setSuccess] = useState("");
  const result = useGetAllCouriers({ page, limit: 10, searchTerm });
  const hubs = useGetAllHubs({ limit: 100 });
  const detail = useGetCourierDetails(
    selection?.mode === "view" ? selection.courier?.id || "" : "",
  );
  const history = useGetCourierHistoryAndEarnings(
    selection?.mode === "view" ? selection.courier?.id || "" : "",
  );
  const create = useCreateCourier(),
    update = useUpdateCourierProfile();
  const busy = create.isPending || update.isPending;
  const close = () => {
    if (!busy) setSelection(null);
  };
  const open = (mode: "view" | "edit" | "create", courier?: Courier) => {
    create.reset();
    update.reset();
    setSuccess("");
    setSelection({ mode, courier });
  };
  const saved = () => {
    setSuccess(
      t(
        "Courier saved. The list has been refreshed.",
        "কর্মীর তথ্য সংরক্ষিত। তালিকা আপডেট হয়েছে।",
      ),
    );
    setSelection(null);
  };
  const selected = detail.data?.data || selection?.courier;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={ui("Manage Couriers")}
        description={ui(
          "Manage delivery personnel, check availability, and view assigned hubs.",
        )}
        action={
          <Button onClick={() => open("create")}>
            <Plus size={17} aria-hidden="true" />
            {ui("Add Courier")}
          </Button>
        }
      />
      <div className={styles.toolbar}>
        <Input
          aria-label={ui("Search couriers...")}
          placeholder={ui("Search couriers...")}
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
                {["Name", "Vehicle", "Availability", "Actions"].map(
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
                    <DataSkeleton />
                  </TableCell>
                </TableRow>
              ) : !result.data?.data.length ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles.empty}>
                    <EmptyStatePanel title={ui("No couriers found.")} />
                  </TableCell>
                </TableRow>
              ) : (
                result.data.data.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell data-label={ui("Name")}>
                      <div className={styles.identity}>
                        <strong>{courier.user?.name}</strong>
                        <span className={styles.secondary}>
                          {courier.user?.email}
                        </span>
                        <span className={styles.secondary}>
                          {courier.contactNumber}
                        </span>
                        {isTestRecord({
                          name: courier.user?.name,
                          email: courier.user?.email,
                        }) && <TestRecordBadge />}
                      </div>
                    </TableCell>
                    <TableCell data-label={ui("Vehicle")}>
                      <div className={styles.identity}>
                        <span className="flex items-center gap-2">
                          <Truck size={16} aria-hidden="true" />
                          {courier.vehicleType
                            ? ui(courier.vehicleType)
                            : ui("N/A")}
                        </span>
                        <span className={styles.secondary}>
                          {courier.vehicleNumber || "—"}
                        </span>
                        <span className={styles.secondary}>
                          {courier.hub
                            ? placeName(courier.hub.name, locale)
                            : t("No hub assigned", "হাব বরাদ্দ নেই")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-label={ui("Availability")}>
                      <span
                        className={[
                          styles.badge,
                          courier.isAvailable ? styles.active : styles.inactive,
                        ].join(" ")}
                      >
                        {ui(courier.isAvailable ? "Available" : "Unavailable")}
                      </span>
                      <p className={styles.secondary}>
                        {display.date(new Date(courier.createdAt))}
                      </p>
                    </TableCell>
                    <TableCell data-label={ui("Actions")}>
                      <div className={styles.actions}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => open("view", courier)}
                        >
                          {ui("View")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => open("edit", courier)}
                        >
                          {ui("Edit")}
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
            ? ui("Add Courier")
            : selection?.mode === "edit"
              ? t("Edit courier", "কর্মীর তথ্য সম্পাদনা")
              : t("Courier details", "কর্মীর বিস্তারিত")
        }
        description={
          selection?.mode === "create"
            ? t(
                "Provision a verified worker account, or review an existing application in Operations.",
                "যাচাইকৃত কর্মীর অ্যাকাউন্ট তৈরি করুন অথবা কার্যক্রম পাতায় আবেদন যাচাই করুন।",
              )
            : t(
                "Profile, assigned hub and delivery history come from the server.",
                "প্রোফাইল, নির্ধারিত হাব ও কাজের ইতিহাস সার্ভার থেকে আসে।",
              )
        }
      >
        {selection?.mode === "view" &&
          (detail.isPending ? (
            <DataSkeleton />
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
              <>
                <dl className={styles.details}>
                  {[
                    [ui("Name"), selected.user?.name || "—"],
                    [ui("Email"), selected.user?.email || "—"],
                    [t("Phone", "ফোন"), selected.contactNumber],
                    [
                      t("Assigned hub", "নির্ধারিত হাব"),
                      selected.hub
                        ? placeName(selected.hub.name, locale)
                        : t("No hub assigned", "হাব বরাদ্দ নেই"),
                    ],
                    [
                      ui("Vehicle"),
                      selected.vehicleType ? ui(selected.vehicleType) : "—",
                    ],
                    [
                      ui("Availability"),
                      ui(selected.isAvailable ? "Available" : "Unavailable"),
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                  {history.data && (
                    <>
                      <div>
                        <dt>
                          {t("Total assigned parcels", "মোট বরাদ্দকৃত পার্সেল")}
                        </dt>
                        <dd>
                          {display.number(history.data.data.totalShipments)}
                        </dd>
                      </div>
                      <div>
                        <dt>{t("Completed deliveries", "সম্পন্ন ডেলিভারি")}</dt>
                        <dd>
                          {display.number(
                            history.data.data.completedDeliveries,
                          )}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                <AdminFeedback error={history.error} />
                <div className={styles.dialogActions}>
                  <Button
                    variant="outline"
                    onClick={() => open("edit", selected)}
                  >
                    {ui("Edit")}
                  </Button>
                </div>
              </>
            )
          ))}
        {(selection?.mode === "create" || selection?.mode === "edit") && (
          <SchemaForm
            schema={selection.courier ? CourierEditSchema : CourierSchema}
            key={selection.courier?.id || "new-courier"}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget),
                hubId = String(data.get("currentHubId") || ""),
                payload = {
                  vehicleType: String(data.get("vehicleType")).trim(),
                  vehicleNumber: String(data.get("vehicleNumber")).trim(),
                  ...(hubId ? { currentHubId: hubId } : {}),
                };
              if (selection.courier)
                update.mutate(
                  {
                    id: selection.courier.id,
                    payload: {
                      ...payload,
                      isAvailable: data.has("isAvailable"),
                    },
                  },
                  { onSuccess: saved },
                );
              else
                create.mutate(
                  {
                    ...payload,
                    name: String(data.get("name")).trim(),
                    email: String(data.get("email")).trim(),
                    contactNumber: String(data.get("contactNumber")).trim(),
                    password: String(data.get("password")),
                  },
                  { onSuccess: saved },
                );
            }}
          >
            {selection.mode === "create" && (
              <Link
                className="inline-flex min-h-11 items-center text-primary underline"
                href="/admin/operations#worker-reviews"
                onClick={close}
              >
                {t(
                  "Review pending worker applications instead",
                  "বিদ্যমান কর্মীর আবেদন যাচাই করুন",
                )}
              </Link>
            )}
            <div className={styles.formGrid}>
              {selection.mode === "create" && (
                <>
                  <label>
                    {ui("Name")}
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    {ui("Email")}
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    {t("Phone", "ফোন")}
                    <input
                      name="contactNumber"
                      type="tel"
                      required
                      pattern={String.raw`(?:\+88|88)?01[3-9][0-9]{8}`}
                    />
                  </label>
                  <label>
                    {t("Initial password", "প্রাথমিক পাসওয়ার্ড")}
                    <input
                      name="password"
                      aria-label={t("Initial password", "প্রাথমিক পাসওয়ার্ড")}
                      aria-describedby="courier-password-guidance"
                      type="password"
                      required
                      minLength={8}
                      maxLength={72}
                      pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,72}"
                      autoComplete="new-password"
                    />
                    <span
                      id="courier-password-guidance"
                      className={styles.secondary}
                    >
                      {t(
                        "Use uppercase, lowercase, a number and a symbol.",
                        "বড়–ছোট অক্ষর, সংখ্যা ও চিহ্ন দিন।",
                      )}
                    </span>
                  </label>
                </>
              )}
              <label>
                {ui("Vehicle")}
                <input
                  name="vehicleType"
                  maxLength={100}
                  defaultValue={selection.courier?.vehicleType || ""}
                />
              </label>
              <label>
                {t("Vehicle number", "যানের নম্বর")}
                <input
                  name="vehicleNumber"
                  maxLength={100}
                  defaultValue={selection.courier?.vehicleNumber || ""}
                />
              </label>
              <label className={styles.full}>
                {t("Assigned hub", "নির্ধারিত হাব")}
                <select
                  name="currentHubId"
                  defaultValue={selection.courier?.currentHubId || ""}
                  disabled={hubs.isPending || hubs.isError}
                >
                  <option
                    value=""
                    disabled={Boolean(selection.courier?.currentHubId)}
                  >
                    {t("No hub assigned", "হাব বরাদ্দ নেই")}
                  </option>
                  {hubs.data?.data.map((hub) => (
                    <option value={hub.id} key={hub.id}>
                      {placeName(hub.name, locale)}
                    </option>
                  ))}
                </select>
              </label>
              {selection.mode === "edit" && (
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={selection.courier?.isAvailable}
                  />
                  {ui("Available")}
                </label>
              )}
            </div>
            <AdminFeedback error={hubs.error || create.error || update.error} />
            <div className={styles.dialogActions}>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={close}
              >
                {t("Cancel", "বাতিল")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy
                  ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                  : t("Save courier", "কর্মীর তথ্য সংরক্ষণ")}
              </Button>
            </div>
          </SchemaForm>
        )}
      </AdminDialog>
    </div>
  );
}
