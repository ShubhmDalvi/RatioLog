import type { DecisionStatus } from "@/lib/decisions/status";

/**
 * Dark status palette — 10% fills, glowing -400 text, 20% borders.
 * Classes are literal strings so Tailwind can scan and generate them.
 */
export const STATUS_BADGE_STYLES: Record<DecisionStatus, string> = {
  PROPOSED: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
  ACCEPTED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  DEPRECATED: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  SUPERSEDED: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  REJECTED: "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

export const STATUS_DOT_STYLES: Record<DecisionStatus, string> = {
  PROPOSED: "bg-indigo-400",
  ACCEPTED: "bg-emerald-400",
  DEPRECATED: "bg-amber-400",
  SUPERSEDED: "bg-purple-400",
  REJECTED: "bg-rose-400",
};
