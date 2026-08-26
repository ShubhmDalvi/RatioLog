import { z } from "zod";

import { DECISION_STATUSES } from "./status";

export const decisionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.enum(DECISION_STATUSES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  tags: z.string().trim().max(400).default(""),
  context: z.string().max(20000).default(""),
  decision: z.string().max(20000).default(""),
  consequences: z.string().max(20000).default(""),
  supersedesId: z.string().trim().max(64).default(""),
});

export type DecisionFormInput = z.infer<typeof decisionFormSchema>;

export type DecisionFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  error?: string;
} | undefined;

export function flattenFieldErrors(
  error: z.ZodError,
): Record<string, string[] | undefined> {
  return error.flatten().fieldErrors;
}
