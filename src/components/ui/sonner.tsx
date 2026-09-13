"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      theme="dark"
      toastOptions={{
        // Success toasts dismiss quickly and sit quiet; error call sites
        // pass an explicit longer duration so failures still get read.
        duration: 1500,
        style: { width: "fit-content", maxWidth: "min(90vw, 420px)" },
        classNames: {
          toast:
            "!w-fit !min-w-0 !max-w-[420px] !rounded-lg !border !border-white/[0.08] !bg-[#18181B] !px-3.5 !py-2.5 !text-[12.5px] !font-medium !tracking-tight !text-white !shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
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
