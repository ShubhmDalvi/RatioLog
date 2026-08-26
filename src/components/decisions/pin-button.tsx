"use client";

import { Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { togglePinAction } from "@/app/(app)/decisions/actions";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./toolbar-button";

export function PinButton({ id, pinned }: { id: string; pinned: boolean }) {
  const router = useRouter();
  const [isPinned, setIsPinned] = useState(pinned);
  const [isPinning, setIsPinning] = useState(false);

  async function toggle() {
    const formData = new FormData();
    formData.set("id", id);

    const optimistic = !isPinned;
    setIsPinned(optimistic);
    setIsPinning(true);

    const res = await togglePinAction(formData);

    if (res.ok) {
      setIsPinned(res.pinned);
      toast.success(res.pinned ? "Pinned to Sidebar" : "Unpinned");
    } else {
      setIsPinned(!optimistic);
    }
    setIsPinning(false);
    router.refresh();
  }

  return (
    <ToolbarButton
      aria-label={isPinned ? "Unpin Decision" : "Pin Decision"}
      aria-pressed={isPinned}
      title={isPinned ? "Unpin Decision" : "Pin Decision"}
      onClick={() => void toggle()}
      disabled={isPinning}
    >
      <Pin
        className={cn(
          "size-[14px] transition-colors duration-150",
          isPinning && "opacity-60",
        )}
        fill={isPinned ? "currentColor" : "none"}
      />
      <span className="hidden sm:inline">
        {isPinned ? "Unpin" : "Pin"}
      </span>
    </ToolbarButton>
  );
}
