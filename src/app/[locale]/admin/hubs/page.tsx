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
import { useGetAllHubs } from "@/hooks";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";

interface IHub {
  id: string;
  name: string;
  location: string;
  address: string;
  createdAt: string;
}

export default function HubsManagementPage() {
  const ui = useUiText();
  const display = useUiFormat();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAllHubs({ page, limit: 10, searchTerm });
  const hubs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {ui("Hub Management")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ui(
              "Manage origin and destination hubs for routing shipments.",
            )}{" "}
          </p>
        </div>
        <Button>
          <Plus className="mr-2" /> {ui("Add Hub")}{" "}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder={ui("Search hubs...")}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ui("Hub Name")}</TableHead>
                <TableHead>{ui("Location")}</TableHead>
                <TableHead>{ui("Detailed Address")}</TableHead>
                <TableHead>{ui("Created At")}</TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : hubs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {ui("No hubs found.")}{" "}
                  </TableCell>
                </TableRow>
              ) : (
                hubs.map((hub: IHub) => (
                  <TableRow key={hub.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        {hub.name}
                      </div>
                    </TableCell>
                    <TableCell>{hub.location}</TableCell>
                    <TableCell className="max-w-62.5 truncate">
                      {hub.address}
                    </TableCell>
                    <TableCell>
                      {display.date(new Date(hub.createdAt))}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">
                        {ui("Edit")}{" "}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {ui("Delete")}{" "}
                      </Button>
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
