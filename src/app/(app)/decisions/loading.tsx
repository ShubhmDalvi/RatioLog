import { Skeleton } from "@/components/skeleton";

export default function DecisionsLoading() {
  return (
    <div aria-busy="true">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton style={{ width: 150, height: 30 }} />
          <Skeleton style={{ width: 280, height: 14 }} />
        </div>
        <Skeleton style={{ width: 120, height: 36 }} />
      </div>

      <Skeleton style={{ width: "100%", height: 104, borderRadius: 12, marginBottom: 20 }} />

      <Skeleton style={{ width: 80, height: 14, marginBottom: 12 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} style={{ width: "100%", height: 108, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}
