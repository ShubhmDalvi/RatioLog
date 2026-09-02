import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GlobalSearchLoader } from "@/components/layout/global-search-loader";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { listDecisionOptions, listPinnedDecisions } from "@/lib/decisions";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? "",
  };
  const userId = session.user.id;

  const [decisions, pinned] = await Promise.all([
    listDecisionOptions(userId),
    listPinnedDecisions(userId),
  ]);

  return (
    <div className="app-shell flex min-h-dvh flex-col text-ink lg:flex-row">
      <MobileNav user={user} pinned={pinned} />
      <Sidebar user={user} pinned={pinned} />
      <GlobalSearchLoader decisions={decisions} />
      <main className="flex min-w-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto w-full max-w-[1180px] flex-1 rounded-2xl border border-white/[0.08] bg-[#141417] px-5 py-8 shadow-2xl sm:px-8 lg:px-10 lg:py-10 max-sm:shadow-none">
          {children}
        </div>
      </main>
    </div>
  );
}
