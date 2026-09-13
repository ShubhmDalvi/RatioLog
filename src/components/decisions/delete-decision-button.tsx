"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDecisionAction } from "@/app/(app)/decisions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToolbarButton } from "./toolbar-button";

export function DeleteDecisionButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", id);

    setIsDeleting(true);
    try {
      const res = await deleteDecisionAction(formData);

      if (res.ok) {
        toast.success("Decision Deleted");
        setConfirmOpen(false);
        router.push("/decisions");
        return;
      }

      toast.error("Could Not Delete Decision", { duration: 3500 });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ToolbarButton
        aria-label="Delete"
        title="Delete"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </ToolbarButton>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm gap-0">
          <DialogHeader>
            <DialogTitle>Delete this decision?</DialogTitle>
            <DialogDescription>
              It is removed along with its record — this cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
