import { Hub } from "./hub.type";
import { Payment } from "./payment.type";
import { User } from "./user.type";

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
  weight: number;
  price: number;
  status: ShipmentStatus;
  estimatedDelivery?: string | null;
  sender?: User;
  courier?: User | null;
  originHub?: Hub | null;
  destinationHub?: Hub | null;
  payment?: Payment | null;
  trackings?: ShipmentTracking[];
  createdAt: string;
  updatedAt: string;
}