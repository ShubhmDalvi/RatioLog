import { Skeleton } from "@/components/skeleton";

export default function ChangelogLoading() {
  return (
    <div aria-busy="true">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        <Skeleton style={{ width: 160, height: 30 }} />
        <Skeleton style={{ width: 280, height: 14 }} />
      </div>
      <Skeleton style={{ width: "100%", height: 200, borderRadius: 12 }} />
    </div>
  );
}
