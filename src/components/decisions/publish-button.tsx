"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { publishDecisionAction } from "@/app/(app)/decisions/actions";
import { ToolbarButton } from "./toolbar-button";

export function PublishButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  async function publish() {
    const formData = new FormData();
    formData.set("id", id);

    setIsPublishing(true);
    const res = await publishDecisionAction(formData);
    setIsPublishing(false);

    if (res.ok) {
      toast.success("Decision Published — now visible to the team");
      router.refresh();
    } else {
      toast.error("Could Not Publish Decision");
    }
  }

  return (
    <ToolbarButton
      aria-label="Publish"
      title="Publish"
      onClick={() => void publish()}
      disabled={isPublishing}
    >
      {isPublishing ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Upload className="size-3.5" />
      )}
      <span className="hidden sm:inline">Publish</span>
    </ToolbarButton>
  );
}
