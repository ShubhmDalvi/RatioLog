"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SidebarContent } from "./sidebar";

type MobileUser = {
  name: string | null;
  email: string;
};

export function MobileNav({
  user,
  pinned,
}: {
  user: MobileUser;
  pinned: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2.5 border-b border-line bg-desk/90 px-4 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 sm:w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col p-3">
            <SidebarContent
              user={user}
              pinned={pinned}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/decisions" className="flex items-center gap-2">
        <Logo size={26} />
        <span className="text-[15px] font-bold tracking-tight text-[#F4F4F5]">
          RatioLog
        </span>
      </Link>
    </header>
  );
}
