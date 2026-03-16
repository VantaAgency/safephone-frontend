import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide / Invalid email"),
  password: z.string().min(8, "8 caractères minimum / Minimum 8 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Nom requis / Name required"),
    email: z.string().email("Email invalide / Invalid email"),
    phone: z
      .string()
      .regex(/^(\+221\s?)?[0-9\s]{9,15}$/, "Format: +221 77 000 00 00")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "8 caractères minimum / Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas / Passwords do not match",
    path: ["confirmPassword"],
  });

export const createDeviceSchema = z.object({
  brand: z.string().min(1, "Marque requise / Brand required"),
  model: z.string().min(1, "Modèle requis / Model required"),
  imei: z.string().regex(/^\d{15}$/, "IMEI: exactement 15 chiffres / Exactly 15 digits"),
});

export const createSubscriptionSchema = z.object({
  device_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(["monthly", "annual"]),
});

export const createClaimSchema = z.object({
  device_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  claim_type: z.enum(["screen", "water", "theft", "breakdown"]),
  description: z.string().max(5000).optional(),
});

export const createPaymentSchema = z.object({
  subscription_id: z.string().uuid(),
  payment_method: z.enum(["wave", "orange_money", "free_money", "card"]),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, "Nom requis / Name required"),
  email: z.string().email("Email invalide / Invalid email"),
  subject: z.string().optional(),
  message: z.string().min(1, "Message requis / Message required"),
});

export const partnerApplicationSchema = z.object({
  storeName: z.string().min(1, "Nom de boutique requis / Store name required"),
  fullName: z.string().min(1, "Nom requis / Name required"),
  phone: z
    .string()
    .regex(/^(\+221\s?)?[0-9\s]{9,15}$/, "Format: +221 77 000 00 00"),
  city: z.string().min(1, "Ville requise / City required"),
});
