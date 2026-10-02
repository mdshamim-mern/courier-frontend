import { z } from "zod";

export const RegisterCustomerZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255),
    email: z.string().email("Invalid email address"),
    contactNumber: z
      .string()
      .regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const LoginZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const ForgotPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const ResetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  }),
});