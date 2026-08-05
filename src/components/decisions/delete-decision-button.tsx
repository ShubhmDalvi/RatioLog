"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDecisionAction } from "@/app/(app)/decisions/actions";
import { Button } from "@/components/ui/button";
import { ToolbarButton } from "./toolbar-button";

export function DeleteDecisionButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", id);

    setIsDeleting(true);
    try {
      const res = await deleteDecisionAction(formData);

      if (res.ok) {
        toast.success("Decision Deleted");
        router.push("/decisions");
        return;
      }

      toast.error("Could Not Delete Decision");
    } finally {
      setIsDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
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
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Deleting…
            </>
          ) : (
            "Delete Permanently"
          )}
        </Button>
      </div>
    );
  }

  return (
    <ToolbarButton
      aria-label="Delete"
      title="Delete"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-3.5" />
      <span className="hidden sm:inline">Delete</span>
    </ToolbarButton>
  );
}
