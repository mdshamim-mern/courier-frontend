export interface ServiceArea {
  id: string;
  name: string;
  district: string;
  upazila: string;
  pickupEnabled: boolean;
  dropoffEnabled?: boolean;
  deliveryEnabled: boolean;
  hubId?: string;
}
export interface Quote {
  serviceType?: string;
  requestedServiceType?: string;
  baseCharge: string;
  extraWeightCharge: string;
  pickupFee: string;
  deliveryCharge: string;
  codFee: string;
  merchantPayable: string;
  deliveryDays: number;
  rateUpdatedAt: string;
  originHub: { name: string; address: string };
}
export interface Collection {
  id: string;
  shipmentId: string;
  merchantId: string;
  courierId: string;
  amount: string;
  fee: string;
  payable: string;
  status: string;
  receiptReference?: string;
  payoutReference?: string;
  createdAt?: string;
  receivedAt?: string;
  paidAt?: string;
}
export interface Business {
  id: string;
  shopName: string;
  pickupAddress: string;
  contactNumber: string;
  payoutMethod: string;
  accountName: string;
  accountNumber: string;
  approved: boolean;
  reviewNote?: string;
  user?: { name: string; email: string };
}
export interface Application {
  id: string;
  contactNumber: string;
  area: string;
  vehicleType: string;
  status: string;
  reviewNote?: string;
  user?: { name: string; email: string };
}
export interface OperationsMine {
  business: Business | null;
  application: Application | null;
  collections: Collection[];
  totals?: {
    expected: string;
    collected: string;
    payable: string;
    paid: string;
    pending: string;
    awaitingCollection: string;
    heldByWorker: string;
  };
}
export interface OperationsAdmin {
  payoutAccounts: Array<Business & { userId: string; updatedAt: string }>;
  areas: ServiceArea[];
  rates: Array<Record<string, string | number | boolean>>;
  applications: Application[];
  businesses: Business[];
  collections: Collection[];
  couriers: Array<{
    userId: string;
    currentHubId: string | null;
    isAvailable: boolean;
    user: { name: string; _count: { deliveries: number } };
  }>;
}
