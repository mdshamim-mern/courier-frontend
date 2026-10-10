import { z } from "zod";
import { BookingSchema } from "./shipment.validation";

const text = z.string().trim().min(2).max(255);
const phone = z
  .string()
  .regex(
    /^(?:\+88|88)?01[3-9]\d{8}$/,
    "Enter a valid Bangladesh mobile number",
  );
const money = z.number().min(0).max(1000000).multipleOf(0.01);
export const BusinessSchema = z.object({
  shopName: text,
  pickupAddress: z.string().trim().min(5).max(500),
  contactNumber: phone,
  payoutMethod: z.enum(["BANK", "BKASH"]),
  accountName: text,
  accountNumber: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .regex(/^[0-9+ -]+$/),
});
export const ApplicationSchema = z.object({
  contactNumber: phone,
  area: text,
  vehicleType: z.enum(["BICYCLE", "MOTORBIKE", "VAN"]),
});
export const AreaSchema = z.object({
  name: text,
  district: text,
  upazila: text,
  hubId: z.string().uuid(),
  pickupEnabled: z.boolean(),
  dropoffEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
});
export const RateSchema = z
  .object({
    pickupAreaId: z.string().uuid(),
    receiverAreaId: z.string().uuid(),
    serviceType: z.enum(["STANDARD", "EXPRESS", "SAME_DAY", "NEXT_DAY"]),
    baseWeight: z.number().min(0.01).max(100),
    baseCharge: money.positive(),
    extraPerKg: money,
    pickupFee: money,
    codPercent: z.number().min(0).max(100).multipleOf(0.01),
    deliveryDays: z.number().int().min(0).max(30),
    cutoffMinutes: z.number().int().min(0).max(1439).nullable(),
    active: z.boolean(),
  })
  .refine(
    (v) =>
      v.serviceType === "SAME_DAY"
        ? v.deliveryDays === 0 && !!v.cutoffMinutes
        : v.deliveryDays >= 1,
    {
      path: ["deliveryDays"],
      message:
        "Same-day requires zero days and a cutoff; other services require at least one day",
    },
  );
export const ReviewSchema = z.object({
  approved: z.boolean(),
  note: z.string().trim().min(2).max(500),
  hubId: z.string().optional(),
});
export const WorkerReviewSchema = ReviewSchema.refine(
  (v) => !v.approved || z.string().uuid().safeParse(v.hubId).success,
  { path: ["hubId"], message: "Choose a hub before approving a worker" },
);
export const SettlementSchema = z.object({
  reference: z.string().trim().min(6).max(100),
});
export const HubSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(500),
});
export const CourierSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.email(),
  contactNumber: phone,
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
  vehicleType: z.string().max(100).optional(),
  vehicleNumber: z.string().max(100).optional(),
  currentHubId: z.string().optional(),
});
export const CourierEditSchema = z.object({
  vehicleType: z.string().max(100).optional(),
  vehicleNumber: z.string().max(100).optional(),
  currentHubId: z.string().optional(),
  isAvailable: z.boolean(),
});
export const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(255),
  contactNumber: phone,
  address: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || v.length >= 5)
    .optional(),
});
export const TrackingSchema = z.object({
  trackingId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^TRK-[A-Za-z0-9-]{4,76}$/,
      "Enter a tracking number beginning with TRK-",
    ),
});
export const QuoteSchema = z.object({
  pickupAreaId: z.string().uuid(),
  receiverAreaId: z.string().uuid(),
  weight: z.number().min(0.01).max(100).multipleOf(0.01),
  codAmount: money,
  serviceType: z.enum(["STANDARD", "EXPRESS", "SAME_DAY", "NEXT_DAY"]),
  pickupMode: z.enum(["HOME", "BRANCH"]),
});
export const AssignmentSchema = z.object({ courierId: z.string().uuid() });
export const DecisionSchema = z.object({
  confirmation: z.literal(true, {
    error: "Confirm this administrative action",
  }),
});
export const FailureSchema = z.object({
  note: z.string().trim().min(5).max(500),
});
export const AcknowledgmentSchema = z.object({
  receiverName: text,
  acknowledged: z.literal(true),
  collectedAmount: money.nullable().optional(),
});
export const PickupSchema = z.object({
  pickupAreaId: z.string().uuid(),
  receiverAreaId: z.string().uuid(),
  senderPhone: phone,
  pickupAddress: z.string().trim().min(5).max(500),
  receiverName: z.string().trim().min(1).max(255),
  receiverPhone: phone,
  receiverAddress: z.string().trim().min(5).max(500),
  pickupMode: z.enum(["HOME", "BRANCH"]),
});
export const BookingFormSchema = z.preprocess((value) => {
  const input = value as Record<string, unknown>;
  const date = new Date(String(input.requestedPickupAt));
  return {
    ...input,
    requestedPickupAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
  };
}, BookingSchema);
