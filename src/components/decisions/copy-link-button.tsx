"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolbarButton } from "./toolbar-button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link Copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could Not Copy Link", { duration: 3500 });
    }
  }

  return (
    <ToolbarButton
      aria-label="Copy link"
      title="Copy link"
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      <span className="hidden sm:inline">
        {copied ? "Copied" : "Copy Link"}
      </span>
    </ToolbarButton>
  );
}
