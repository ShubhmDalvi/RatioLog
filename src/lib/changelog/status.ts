export const CHANGELOG_TYPES = [
  "ADDED",
  "CHANGED",
  "FIXED",
  "DEPRECATED",
  "REMOVED",
] as const;

export type ChangelogType = (typeof CHANGELOG_TYPES)[number];

export const CHANGELOG_TYPE_LABELS: Record<ChangelogType, string> = {
  ADDED: "Added",
  CHANGED: "Changed",
  FIXED: "Fixed",
  DEPRECATED: "Deprecated",
  REMOVED: "Removed",
};

export const CHANGELOG_TYPE_BADGE_STYLES: Record<ChangelogType, string> = {
  ADDED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  CHANGED: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  FIXED: "border-teal-500/20 bg-teal-500/10 text-teal-400",
  DEPRECATED: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  REMOVED: "border-red-500/20 bg-red-500/10 text-red-400",
};

export const CHANGELOG_TYPE_DOT_STYLES: Record<ChangelogType, string> = {
  ADDED: "bg-emerald-400",
  CHANGED: "bg-sky-400",
  FIXED: "bg-teal-400",
  DEPRECATED: "bg-amber-400",
  REMOVED: "bg-red-400",
};
