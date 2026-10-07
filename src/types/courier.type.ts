import type { Hub } from "./hub.type";
import type { User } from "./user.type";

export interface Courier {
  id: string;
  userId: string;
  contactNumber: string;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  isAvailable: boolean;
  currentHubId?: string | null;
  user?: User;
  hub?: Hub;
  createdAt: string;
  updatedAt: string;
}

export interface CourierEarnings {
  totalEarnings: number | null;
  totalShipments: number;
  completedDeliveries: number;
  performanceRate: number;
  compensationConfigured: boolean;
  shipments: import("./shipment.type").Shipment[];
}
