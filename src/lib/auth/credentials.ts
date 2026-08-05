import "server-only";

import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export const signupSchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
