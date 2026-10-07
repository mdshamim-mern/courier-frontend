import type { Hub } from "./hub.type";
import type { Payment } from "./payment.type";
import type { User } from "./user.type";

export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURNED"
  | "CANCELLED";

export interface ShipmentTracking {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  hubId?: string | null;
  location?: string | null;
  note?: string | null;
  updatedById?: string | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  senderId: string;
  courierId?: string | null;
  originHubId?: string | null;
  destinationHubId?: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number | string;
  price: number | string;
  status: ShipmentStatus;
  estimatedDelivery?: string | null;
  sender?: User;
  courier?: User | null;
  originHub?: Hub | null;
  destinationHub?: Hub | null;
  payment?: Payment | null;
  trackings?: ShipmentTracking[];
  paymentStatus: import("./payment.type").PaymentStatus;
  allowedNextStatuses: ShipmentStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicShipmentTracking {
  trackingId: string;
  status: ShipmentStatus;
  estimatedDelivery?: string | null;
  trackings: Pick<ShipmentTracking, "id" | "status" | "createdAt">[];
}
