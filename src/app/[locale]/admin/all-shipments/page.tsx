"use client";

import { useUiText, useUiFormat } from "@/i18n/use-ui-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useGetAllShipments } from "@/hooks";
import { useState, useEffect, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function AllShipmentsContent() {
  const ui = useUiText();
  const display = useUiFormat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { data, isLoading } = useGetAllShipments({
    page,
    limit: 10,
    searchTerm,
  });
  const shipments = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    if (!value) params.delete("search");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange: Dispatch<SetStateAction<number>> = (value) => {
    const newPage = typeof value === "function" ? value(page) : value;
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlSearch = searchParams.get("search") || "";
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
  }, [searchParams, page, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {ui("All Shipments")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ui(
            "Monitor all active and completed shipments across the platform.",
          )}{" "}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder={ui("Search by tracking ID or receiver name...")}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Tracking ID")}</TableHead>
                <TableHead>{ui("Date")}</TableHead>
                <TableHead>{ui("Customer")}</TableHead>
                <TableHead>{ui("Receiver")}</TableHead>
                <TableHead>{ui("Hubs")}</TableHead>
                <TableHead>{ui("Status")}</TableHead>
                <TableHead className="text-right">{ui("Actions")}</TableHead>
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
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No shipments found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {shipment.trackingId}
                    </TableCell>
                    <TableCell>
                      {display.date(new Date(shipment.createdAt))}
                    </TableCell>
                    <TableCell className="truncate max-w-37.5">
                      {shipment.sender?.name || ui("Unknown")}
                    </TableCell>
                    <TableCell className="truncate max-w-37.5">
                      <div className="flex flex-col">
                        <span className="text-sm">{shipment.receiverName}</span>
                        <span className="text-xs text-muted-foreground">
                          {shipment.receiverPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="truncate max-w-37.5">
                          {ui("From:")} {shipment.originHub?.name || ui("N/A")}
                        </span>
                        <span className="truncate max-w-37.5">
                          {ui("To:")}{" "}
                          {shipment.destinationHub?.name || ui("N/A")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wider">
                        {ui(shipment.status.replace(/_/g, " "))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {shipment.status === "PENDING" ? (
                        <Button variant="default" size="sm">
                          {ui("Assign Courier")}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          {ui("View Details")}
                        </Button>
                      )}
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
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function AllShipmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <AllShipmentsContent />
    </Suspense>
  );
}
