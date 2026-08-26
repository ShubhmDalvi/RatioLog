"use client";

import { format } from "date-fns";
import { FileText, History, Plus, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/decisions/status-badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { DecisionOption } from "@/lib/decisions";

const NAV_ITEMS = [
  { label: "Go to Decisions", href: "/decisions", icon: FileText },
  { label: "Go to Changelog", href: "/changelog", icon: History },
  { label: "Go to Settings", href: "/settings", icon: Settings },
] as const;

export function GlobalSearch({ decisions }: { decisions: DecisionOption[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const openPalette = () => setOpen(true);
    window.addEventListener("ratiolog:open-search", openPalette);
    return () => window.removeEventListener("ratiolog:open-search", openPalette);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => {
                setOpen(false);
                router.push(item.href);
              }}
            >
              <item.icon className="size-4 text-ink-faint" />
              <span className="flex-1 truncate">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem
            value="New Decision"
            onSelect={() => {
              setOpen(false);
              router.push("/decisions?new=1");
            }}
          >
            <Plus className="size-4 text-ink-faint" />
            <span className="flex-1 truncate">New Decision</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Decisions">
          {decisions.map((decision) => (
            <CommandItem
              key={decision.id}
              value={decision.title}
              onSelect={() => {
                setOpen(false);
                router.push(`/decisions/${decision.id}`);
              }}
            >
              <Search className="size-4 text-ink-faint" />
              <span className="flex-1 truncate">{decision.title}</span>
              <span className="text-xs text-ink-faint">
                {format(decision.date, "MMM d, yyyy")}
              </span>
              <StatusBadge status={decision.status} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <p className="flex items-center gap-1.5 border-t border-white/[0.08] px-3 py-2.5 text-[11px] text-zinc-500">
        <kbd className="font-mono text-[10px]">↑</kbd>
        <kbd className="font-mono text-[10px]">↓</kbd>
        <span>navigate</span>
        <span aria-hidden="true" className="mx-0.5">·</span>
        <kbd className="font-mono text-[10px]">↵</kbd>
        <span>select</span>
        <span aria-hidden="true" className="mx-0.5">·</span>
        <kbd className="font-mono text-[10px]">esc</kbd>
        <span>close</span>
      </p>
    </CommandDialog>
  );
}
