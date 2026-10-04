"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useGetAllCouriers } from "@/hooks";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ICourier {
  id: string;
  user?: {
    name: string;
    email: string;
  };
  contactNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
  createdAt: string;
}

function ManageCouriersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { data, isLoading } = useGetAllCouriers({ page, limit: 10, searchTerm });
  const couriers = data?.data || [];
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Manage Couriers</h1>
          <p className="text-sm text-muted-foreground">
            Manage delivery personnel, check availability, and view assigned hubs.
          </p>
        </div>
        <Button>
          <Plus className="mr-2" /> Add Courier
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search couriers..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email & Phone</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : couriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No couriers found.
                  </TableCell>
                </TableRow>
              ) : (
                couriers.map((courier: ICourier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">{courier.user?.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{courier.user?.email}</span>
                        <span className="text-xs text-muted-foreground">{courier.contactNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {courier.vehicleType ? (
                        <div className="flex flex-col">
                          <span className="text-sm capitalize">{courier.vehicleType}</span>
                          <span className="text-xs text-muted-foreground">{courier.vehicleNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${courier.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {courier.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(courier.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View
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
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function ManageCouriersPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-150 rounded-xl" />}>
      <ManageCouriersContent />
    </Suspense>
  );
}