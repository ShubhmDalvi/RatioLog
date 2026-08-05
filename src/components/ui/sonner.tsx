"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: { width: "fit-content", maxWidth: "min(90vw, 420px)" },
        classNames: {
          toast:
            "!w-fit !min-w-0 !max-w-[420px] !rounded-lg !border !border-white/10 !bg-[#18181B] !px-4 !py-3 !text-[13px] !font-medium !tracking-tight !text-white !shadow-2xl",
          title: "!text-white !font-medium !tracking-tight",
          description: "!text-white/70 !text-[12px]",
          actionButton:
            "!rounded-md !bg-white !px-2.5 !py-1 !text-[12px] !font-medium !text-[#1A1A1C]",
          cancelButton:
            "!rounded-md !bg-white/10 !px-2.5 !py-1 !text-[12px] !font-medium !text-white/80",
        },
      }}
    />
  );
}
