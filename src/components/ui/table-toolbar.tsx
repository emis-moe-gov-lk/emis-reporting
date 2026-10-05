"use client";

import { ReactNode, useState } from "react";
import { Search, Plus, ListFilter, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Sentinel used for the "All" option — Radix Select items may not use "" as a value. */
const ALL = "__all__";

export interface FilterDef {
  key: string;
  label: string;
  /** Shown but greyed out in the menu until a parent filter is chosen (cascades). */
  disabled?: boolean;
}

/**
 * Tracks which filters are currently active (added via "+ Add Filter").
 * Values stay in page-level state — this hook only manages visibility.
 */
export function useActiveFilters() {
  const [active, setActive] = useState<string[]>([]);

  return {
    active,
    add: (key: string) => setActive((a) => (a.includes(key) ? a : [...a, key])),
    remove: (key: string) => setActive((a) => a.filter((k) => k !== key)),
    removeMany: (keys: string[]) => setActive((a) => a.filter((k) => !keys.includes(k))),
    reset: () => setActive([]),
  };
}

/**
 * Compact toolbar rendered INSIDE the table card: search on the left and a
 * highlighted "+ Add Filter" menu on the right. The table stays the focus.
 */
export function TableToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  active,
  onAddFilter,
  className,
}: {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterDef[];
  active: string[];
  onAddFilter: (key: string) => void;
  className?: string;
}) {
  const inactive = filters.filter((f) => !active.includes(f.key));

  return (
    <div className={cn("flex items-center justify-between gap-3 border-b px-5 py-3", className)}>
      {/* Search — left */}
      <div className="relative w-full max-w-[600px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pl-9"
          aria-label="Search records"
        />
      </div>

      {/* Add filter — right, highlighted */}
      {filters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus />
              Add Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {inactive.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                All filters added
              </div>
            ) : (
              inactive.map((f) => (
                <DropdownMenuItem
                  key={f.key}
                  disabled={f.disabled}
                  onSelect={() => onAddFilter(f.key)}
                >
                  <ListFilter />
                  {f.label}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Strip that holds the added filter controls — visually distinct from search. */
export function ActiveFiltersRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b bg-muted/30 px-5 py-3">
      {children}
    </div>
  );
}

/**
 * A labelled dropdown filter with an ✕ remove button. The label + filter icon
 * make it obvious this is a filter; ✕ removes it from the active filter row.
 * Selecting the "All" option reports "" through onChange.
 * When `disabled` is set the control stays visible but cannot be changed —
 * used by the cascading geo chain where a level unlocks only after its parent.
 */
export function ActiveFilterSelect({
  label,
  value,
  onChange,
  options,
  onRemove,
  placeholder,
  className,
  disabled,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  onRemove: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const allLabel = placeholder ?? "All";

  return (
    <div className={cn("flex items-end gap-1", disabled && "opacity-50", className)}>
      <div className="flex flex-col gap-1">
        <Label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <ListFilter className="h-3 w-3" />
          {label}
        </Label>
        <Select
          value={value ? value : ALL}
          onValueChange={(v) => onChange(v === ALL ? "" : v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[160px] text-[13px]">
            <SelectValue placeholder={allLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{allLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!disabled && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
