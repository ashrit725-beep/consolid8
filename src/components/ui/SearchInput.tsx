"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={12}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-fg-faint"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-full rounded-sm border border-line bg-surface-inset pr-7 pl-7 text-[12px] text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-xs p-0.5 text-fg-faint transition-colors hover:text-fg"
        >
          <X size={11} />
        </button>
      ) : null}
    </div>
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-7 appearance-none rounded-sm border border-line bg-surface-inset py-0 pr-6 pl-2.5 text-[11px] text-fg-muted transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 8 5"
        className="pointer-events-none absolute right-2 h-[5px] w-2 fill-fg-faint"
      >
        <path d="M0 0h8L4 5z" />
      </svg>
    </label>
  );
}
