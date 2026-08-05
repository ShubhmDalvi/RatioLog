import { Skeleton } from "@/components/skeleton";

export default function EditDecisionLoading() {
  return (
    <div aria-busy="true">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        <Skeleton style={{ width: 200, height: 30 }} />
        <Skeleton style={{ width: "50%", height: 14 }} />
      </div>

      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
        <Skeleton style={{ width: "100%", height: 44, borderRadius: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton style={{ height: 44, borderRadius: 8 }} />
          <Skeleton style={{ height: 44, borderRadius: 8 }} />
        </div>
        <Skeleton style={{ width: "100%", height: 44, borderRadius: 8 }} />
        <Skeleton style={{ width: "100%", height: 130, borderRadius: 8 }} />
        <Skeleton style={{ width: "100%", height: 170, borderRadius: 8 }} />
        <Skeleton style={{ width: "100%", height: 130, borderRadius: 8 }} />
      </div>
    </div>
  );
}
