"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAccountAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await deleteAccountAction();
      if (res.ok) {
        router.replace("/login");
        return;
      }
      toast.error("Could Not Delete Account");
      setIsDeleting(false);
    } catch {
      setIsDeleting(false);
      toast.error("Could Not Delete Account");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="mt-5"
        onClick={() => setOpen(true)}
      >
        Delete Account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={!isDeleting}
          className="sm:max-w-md"
          onPointerDownOutside={(event) => {
            if (isDeleting) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Delete your account?
            </DialogTitle>
            <DialogDescription>
              This permanently deletes your account and{" "}
              <strong>all decisions you created</strong>, along with any
              changelog entries and pins. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
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
                <>
                  <Trash2 className="size-3.5" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
