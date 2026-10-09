import { z } from "zod";
const phone = z
  .string()
  .regex(/^(?:\+88|88)?01[3-9]\d{8}$/, "Invalid phone number");
const money = z.number().min(0).max(1000000).multipleOf(0.01);
export const BookingSchema = z
  .object({
    pickupAreaId: z.string().uuid(),
    receiverAreaId: z.string().uuid(),
    senderPhone: phone,
    pickupAddress: z.string().trim().min(5).max(500),
    receiverName: z.string().trim().min(1).max(255),
    receiverPhone: phone,
    receiverAddress: z.string().trim().min(5).max(500),
    weight: z.number().min(0.01).max(100).multipleOf(0.01),
    pickupMode: z.enum(["HOME", "BRANCH"]).default("HOME"),
    serviceType: z
      .enum(["STANDARD", "EXPRESS", "SAME_DAY", "NEXT_DAY"])
      .default("STANDARD"),
    productType: z.enum(["DOCUMENT", "PARCEL", "FRAGILE"]),
    declaredValue: money,
    codAmount: money.default(0),
    requestedPickupAt: z
      .string()
      .datetime({ offset: true })
      .refine(
        (value) =>
          Date.parse(value) > Date.now() &&
          Date.parse(value) < Date.now() + 30 * 86400000,
      ),
    deliveryInstructions: z.string().trim().max(500).default(""),
  })
  .strict()
  .refine((value) => value.codAmount <= value.declaredValue, {
    path: ["codAmount"],
    message: "COD cannot exceed declared value",
  });
export const CreateShipmentSchema = z.object({ body: BookingSchema });
export const UpdateShipmentStatusSchema = z.object({
  body: z
    .object({
      status: z.enum([
        "PENDING",
        "ASSIGNED",
        "PICKED_UP",
        "AT_ORIGIN_HUB",
        "IN_TRANSIT",
        "AT_DESTINATION_HUB",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "DELIVERY_FAILED",
        "RETURNED",
        "CANCELLED",
      ]),
      hubId: z.string().uuid().optional(),
      note: z.string().max(500).optional(),
      proof: z
        .object({
          receiverName: z.string().min(2),
          signature: z.string().max(100000),
          acknowledged: z.literal(true),
        })
        .optional(),
      collectedAmount: money.optional(),
    })
    .strict(),
});
