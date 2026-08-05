"use client";

import { Check } from "lucide-react";
import { useRef, useState } from "react";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TagChip } from "@/components/tag-chip";
import { MAX_TAGS, parseTags } from "@/lib/decisions/tags";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
};

export function TagInput({ value, onChange, availableTags }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = availableTags
    .filter((tag) => !value.includes(tag))
    .filter((tag) => tag.includes(query.trim().toLowerCase()));

  function addToken(raw: string) {
    const parsed = parseTags(raw);
    const next = [...value];
    for (const tag of parsed) {
      if (!next.includes(tag) && next.length < MAX_TAGS) {
        next.push(tag);
      }
    }
    onChange(next);
  }

  function addTag(tag: string) {
    if (value.includes(tag) || value.length >= MAX_TAGS) {
      return;
    }
    onChange([...value, tag]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const token = query.trim();
      if (token) {
        addToken(token);
        setQuery("");
      }
    } else if (event.key === "Backspace" && !query && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/30">
          {value.map((tag) => (
            <TagChip key={tag} onRemove={() => removeTag(tag)}>
              {tag}
            </TagChip>
          ))}
          <PopoverTrigger asChild>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value) {
                  setOpen(true);
                }
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? "Add tags…" : ""}
              className="h-6 min-w-[80px] flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-500"
            />
          </PopoverTrigger>
        </div>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-64 p-0"
        >
          <Command shouldFilter={false}>
            <CommandList>
              {filtered.length === 0 ? (
                <p className="px-2 py-1.5 text-[12px] text-ink-muted">
                  {query.trim()
                    ? `Press Enter to add "${query.trim()}"`
                    : "No matching tags"}
                </p>
              ) : (
                <CommandGroup>
                  {filtered.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => {
                        addTag(tag);
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      <Check className="size-3.5 shrink-0 opacity-0" />
                      <span className="truncate">{tag}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-xs text-ink-muted">
        Pick existing tags or type and press Enter to create a new one.
      </p>
    </div>
  );
}
