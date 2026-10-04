"use client";

import { useState } from "react";
import { useGetAllUsers, useUpdateUserRole, useUpdateUserStatus } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import TablePagination from "@/components/ui/table-pagination";
import { format } from "date-fns";

interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UserManagementTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading } = useGetAllUsers({ page, limit: 10, searchTerm });
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  const users = data?.data || [];
  const meta = data?.meta;

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    updateStatus(
      { id, payload: { status: newStatus } },
      {
        onSuccess: () => toast.add({ title: "Status Updated", type: "success" }),
        onError: (err: Error) => toast.add({ title: "Update Failed", description: err.message, type: "error" }),
      }
    );
  };

  const handleRoleChange = (id: string, newRole: string) => {
    updateRole(
      { id, payload: { role: newRole } },
      {
        onSuccess: () => toast.add({ title: "Role Updated", type: "success" }),
        onError: (err: Error) => toast.add({ title: "Update Failed", description: err.message, type: "error" }),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: IUser) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isUpdatingRole || user.role === "SUPER_ADMIN"}
                      className="bg-transparent border border-input rounded-md text-sm p-1 focus:ring-2 focus:ring-primary"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="COURIER">Courier</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={user.status === "ACTIVE" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleStatusChange(user.id, user.status)}
                      disabled={isUpdatingStatus || user.role === "SUPER_ADMIN"}
                    >
                      {user.status === "ACTIVE" ? "Block" : "Unblock"}
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
  );
}