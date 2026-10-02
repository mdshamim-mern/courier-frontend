import { User } from "./user.type";

export interface DashboardStats {
  totalCustomers: number;
  totalCouriers: number;
  totalShipments: number;
  totalRevenue: number;
  shipmentsByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityId: string;
  entityType: string;
  details?: Record<string, unknown> | null;
  user?: User | null;
  createdAt: string;
}