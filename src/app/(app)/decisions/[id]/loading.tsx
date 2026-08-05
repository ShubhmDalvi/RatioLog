import { Skeleton } from "@/components/skeleton";

export default function DecisionDetailLoading() {
  return (
    <div aria-busy="true" style={{ maxWidth: 780 }}>
      <Skeleton style={{ width: 90, height: 14, marginBottom: 24 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 28, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <Skeleton style={{ width: 110, height: 24, borderRadius: 999 }} />
        <Skeleton style={{ width: "70%", height: 32 }} />
        <Skeleton style={{ width: 220, height: 14 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} style={{ width: "100%", height: 180, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}
