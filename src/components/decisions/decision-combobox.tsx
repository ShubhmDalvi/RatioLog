"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DecisionComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; title: string }[];
  placeholder?: string;
  emptyText?: string;
};

export function DecisionCombobox({
  value,
  onChange,
  options,
  placeholder = "Select a decision…",
  emptyText = "No decisions found.",
}: DecisionComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="decision-combobox-list"
          className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[13px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              selected ? "text-white" : "text-zinc-500",
            )}
          >
            {selected ? selected.title : placeholder}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-ink-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        id="decision-combobox-list"
        className="w-[var(--radix-popover-trigger-width)] min-w-0 p-0"
      >
        <Command shouldFilter>
          <CommandInput placeholder="Search decisions…" className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    value === "" ? "opacity-100" : "opacity-0",
                  )}
                />
                — None —
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.title}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      value === option.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
