import { Hub } from "./hub.type";
import { User } from "./user.type";

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