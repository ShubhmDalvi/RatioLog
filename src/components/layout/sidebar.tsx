"use client";

import { Bookmark, FileText, History, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type SidebarUser = {
  name: string | null;
  email: string;
};

const NAV_ITEMS = [
  { label: "Decisions", href: "/decisions", icon: FileText },
  { label: "Changelog", href: "/changelog", icon: History },
] as const;

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

/**
 * Shared navigation content, used by the desktop sidebar and the mobile
 * sheet drawer.
 */
export function SidebarContent({
  user,
  pinned,
  onNavigate,
}: {
  user: SidebarUser;
  pinned: { id: string; title: string }[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="px-2.5 pb-4">
        <Link
          href="/decisions"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <Logo size={28} />
          <span className="text-[17px] font-bold tracking-tight text-[#F4F4F5]">
            RatioLog
          </span>
        </Link>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        aria-label="Main"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
              isActive(item.href)
                ? "bg-white/[0.08] font-medium text-white before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-brand"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        ))}

        <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
          Pinned
        </div>

        {pinned.length === 0 ? (
          <p className="px-2 py-1.5 text-[12px] text-ink-muted">
            Nothing Pinned Yet
          </p>
        ) : (
          pinned.map((decision) => (
            <Link
              key={decision.id}
              href={`/decisions/${decision.id}`}
              onClick={onNavigate}
              className="flex w-full cursor-pointer items-center gap-2 truncate rounded-md px-2 py-1.5 text-[13px] text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <Bookmark className="size-[14px] shrink-0" strokeWidth={1.75} />
              <span className="truncate">{decision.title}</span>
            </Link>
          ))
        )}
      </nav>

      <div className="shrink-0 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors duration-200 hover:bg-white/[0.04]"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18181B] text-[13px] font-medium text-white shadow-sm">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-1 flex-col overflow-hidden text-left">
                <span className="mb-1 block truncate text-[13px] font-medium leading-none text-white">
                  {user.name ?? "Account"}
                </span>
                <span className="block truncate text-[11px] leading-none text-ink-muted">
                  {user.email}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="font-normal text-ink-faint">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate}>
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                void signOutAction();
              }}
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

/** Fixed desktop sidebar. Hidden below the responsive breakpoint. */
export function Sidebar({
  user,
  pinned,
}: {
  user: SidebarUser;
  pinned: { id: string; title: string }[];
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col p-3 lg:flex">
      <SidebarContent user={user} pinned={pinned} />
    </aside>
  );
}
