export const DECISION_STATUSES = [
  "PROPOSED",
  "ACCEPTED",
  "DEPRECATED",
  "SUPERSEDED",
  "REJECTED",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const STATUS_LABELS: Record<DecisionStatus, string> = {
  PROPOSED: "Proposed",
  ACCEPTED: "Accepted",
  DEPRECATED: "Deprecated",
  SUPERSEDED: "Superseded",
  REJECTED: "Rejected",
};
