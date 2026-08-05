"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Input } from "./input";

function PasswordInput({
  className,
  inputClassName,
  ...props
}: React.ComponentProps<"input"> & { inputClassName?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", inputClassName)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-zinc-400 transition-colors hover:text-white"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
