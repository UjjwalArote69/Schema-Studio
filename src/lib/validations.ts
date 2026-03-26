import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({message: "Username is required." })
    .min(3, "Username is required")
    .max(100, "Name must be 100 characters or fewer.")
    .transform((v) => v.trim())
    .optional()
    .nullable(),

  email: z
    .string({message: "Email is required." })
    .min(1, "Email is required.")
    .email("Please provide a valid email address.")
    .max(320, "Email is too long.")
    .transform((v) => v.trim().toLowerCase()),

  password: z
    .string({message: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});

export type RegisterInput = z.infer<typeof registerSchema>;