import { z } from "zod";

export const CreateShipmentSchema = z.object({
  body: z.object({
    receiverName: z.string().min(2, "Receiver name is required"),
    receiverPhone: z.string().regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Invalid phone number"),
    receiverAddress: z.string().min(5, "Detailed address is required"),
    weight: z.number().positive().max(100, "Weight exceeds limit"),
    originHubId: z.string().min(1, "Origin hub is required"),
    destinationHubId: z.string().min(1, "Destination hub is required"),
  }).refine((data) => data.originHubId !== data.destinationHubId, {
    message: "Origin and Destination hubs cannot be the same",
    path: ["destinationHubId"],
  }),
});

export const UpdateShipmentStatusSchema = z.object({
  body: z.object({
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
    hubId: z.string().optional(),
    note: z.string().optional(),
  }),
});