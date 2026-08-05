export const MAX_TAGS = 12;

export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean),
    ),
  ).slice(0, MAX_TAGS);
}

export function formatTags(tags: string[]): string {
  return tags.join(", ");
}

export function safeParseTags(tagsJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(tagsJson);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}
