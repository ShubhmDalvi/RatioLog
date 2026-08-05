"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { changeStatusAction } from "@/app/(app)/decisions/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DECISION_STATUSES, STATUS_LABELS } from "@/lib/decisions/status";
import type { DecisionStatus } from "@/lib/decisions/status";
import { cn } from "@/lib/utils";

import { STATUS_DOT_STYLES } from "./status-styles";

export function ChangeStatusMenu({
  id,
  current,
}: {
  id: string;
  current: DecisionStatus;
}) {
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);

  async function changeTo(status: DecisionStatus) {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", status);

    setIsChanging(true);
    const res = await changeStatusAction(formData);
    setIsChanging(false);

    if (res.ok && res.status) {
      toast.success(`Status Changed to ${STATUS_LABELS[res.status as DecisionStatus]}`);
    } else {
      toast.error("Could Not Change Status");
    }
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Change Status"
          disabled={isChanging}
        >
          {isChanging ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", STATUS_DOT_STYLES[current])}
            />
          )}
          {STATUS_LABELS[current]}
          <ChevronDown className="size-3.5 text-ink-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {DECISION_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => void changeTo(status)}
            disabled={isChanging}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", STATUS_DOT_STYLES[status])}
            />
            {STATUS_LABELS[status]}
            {status === current ? (
              <Check className="ml-auto size-3.5" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
