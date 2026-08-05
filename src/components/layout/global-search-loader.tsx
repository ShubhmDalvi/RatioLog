"use client";

import dynamic from "next/dynamic";

import type { DecisionOption } from "@/lib/decisions";

const GlobalSearch = dynamic(
  () => import("@/components/layout/global-search").then((m) => m.GlobalSearch),
  { ssr: false },
);

export function GlobalSearchLoader({
  decisions,
}: {
  decisions: DecisionOption[];
}) {
  return <GlobalSearch decisions={decisions} />;
}
