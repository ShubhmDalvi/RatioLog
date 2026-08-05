"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteChangelogEntryAction } from "@/app/(app)/changelog/actions";
import { Button } from "@/components/ui/button";

export function DeleteChangelogEntryButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", id);

    setIsDeleting(true);
    try {
      const res = await deleteChangelogEntryAction(formData);

      if (res.ok) {
        toast.success("Changelog Entry Deleted");
        router.refresh();
        return;
      }

      toast.error("Could Not Delete Changelog Entry");
    } finally {
      setIsDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
        >
          Keep
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          className="disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Delete"
      title="Delete"
      onClick={() => setConfirming(true)}
      className="flex h-7 items-center rounded-md px-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
