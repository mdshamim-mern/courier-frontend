"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useGetAllShipments } from "@/hooks";
import { format } from "date-fns";
import { useState } from "react";

export default function AllShipmentsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAllShipments({ page, limit: 10, searchTerm });
  const shipments = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">All Shipments</h1>
        <p className="text-sm text-muted-foreground">
          Monitor all active and completed shipments across the platform.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search by tracking ID or receiver name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Hubs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No shipments found.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((shipment: any) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs font-semibold">{shipment.trackingId}</TableCell>
                    <TableCell>{format(new Date(shipment.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{shipment.sender?.name || "Unknown"}</TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      <div className="flex flex-col">
                        <span className="text-sm">{shipment.receiverName}</span>
                        <span className="text-xs text-muted-foreground">{shipment.receiverPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="truncate max-w-[150px]">From: {shipment.originHub?.name || "N/A"}</span>
                        <span className="truncate max-w-[150px]">To: {shipment.destinationHub?.name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wider">
                        {shipment.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {shipment.status === "PENDING" ? (
                        <Button variant="default" size="sm">Assign Courier</Button>
                      ) : (
                        <Button variant="outline" size="sm">View Details</Button>
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
            handlePageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}