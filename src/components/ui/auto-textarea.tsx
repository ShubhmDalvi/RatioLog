"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { Textarea } from "./textarea";

function AutoTextarea({
  className,
  style,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [resize, props.value]);

  return (
    <Textarea
      ref={ref}
      onInput={resize}
      style={{ ...style, resize: "none" }}
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

export { AutoTextarea };
