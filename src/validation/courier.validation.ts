import { z } from "zod";

export const CreateCourierSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    contactNumber: z.string().regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Invalid phone number"),
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    currentHubId: z.string().optional(),
  }),
});

export const UpdateCourierSchema = z.object({
  body: z.object({
    vehicleType: z.string().optional(),
    vehicleNumber: z.string().optional(),
    isAvailable: z.boolean().optional(),
    currentHubId: z.string().optional(),
  }),
});