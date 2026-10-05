"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronsUpDown, ListFilter, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/** A column the search box can target (e.g. Teacher Name / NIC / School Name). */
export interface SearchColumn {
  /** Stable key handed back through `onSearchColumnChange`. */
  value: string;
  /** Label shown in the "Search in" menu. */
  label: string;
}

/** One filter control rendered inside the filter panel. */
export interface AnalyticsFilterDef {
  /** Stable key, used in `filterValues` and `onFilterChange`. */
  key: string;
  /** Label above the control and in the active-filter chips. */
  label: string;
  /** Options the user can pick from. */
  options: string[];
  /** Disabled controls stay visible but locked (used by the geo cascade). */
  disabled?: boolean;
  /** Placeholder shown while the control is disabled, e.g. "Select Province first". */
  disabledPlaceholder?: string;
  /** Label of the "no filter" choice. Defaults to "All". */
  allLabel?: string;
  /** Show a search field inside the popover. Defaults to true. */
  searchable?: boolean;
}

export interface AnalyticsFilterBarProps {
  /** Current search text. */
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  /** Columns the search can target. The first entry is treated as the default. */
  searchColumns: SearchColumn[];
  /** Key of the currently targeted search column. */
  searchColumn: string;
  onSearchColumnChange: (value: string) => void;
  /** Filter controls, rendered in the given order inside the panel. */
  filters: AnalyticsFilterDef[];
  /** Current value per filter key; "" means "not filtered". */
  filterValues: Record<string, string>;
  /**
   * Called when a filter value changes; "" clears that filter. The parent owns
   * cascade clearing (children of a changed level) and should reset pagination
   * to page 1 here when the consuming table paginates.
   */
  onFilterChange: (key: string, value: string) => void;
  /** Resets every filter (and cascade) to its initial state. */
  onClearFilters: () => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Search field with in-field column picker                                    */
/* -------------------------------------------------------------------------- */

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  columns: SearchColumn[];
  column: string;
  onColumnChange: (value: string) => void;
}

function SearchField({ value, onChange, columns, column, onColumnChange }: SearchFieldProps) {
  const active = columns.find((c) => c.value === column) ?? columns[0];
  const isDefault = active?.value === columns[0]?.value;

  if (!active) return null;

  return (
    <div className="relative w-full md:w-1/2">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Search by ${active.label}…`}
        aria-label={`Search by ${active.label}`}
        className="h-9 pl-9 pr-12"
      />
      {/* Excel-style column chooser, embedded at the right edge of the field */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Search in: ${active.label}`}
                className={cn(
                  "absolute right-1.5 top-1/2 inline-flex h-6 -translate-y-1/2 items-center gap-0.5 rounded-sm px-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isDefault ? "text-muted-foreground hover:text-accent-foreground" : "text-primary"
                )}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Search in: {active.label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Search in</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={active.value} onValueChange={onColumnChange}>
            {columns.map((c) => (
              <DropdownMenuRadioItem key={c.value} value={c.value}>
                {c.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Single filter control (searchable combobox)                                 */
/* -------------------------------------------------------------------------- */

interface FilterComboboxProps {
  def: AnalyticsFilterDef;
  value: string;
  onChange: (value: string) => void;
}

function FilterCombobox({ def, value, onChange }: FilterComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const hasValue = Boolean(value);
  const allLabel = def.allLabel ?? "All";
  const placeholder =
    def.disabled && def.disabledPlaceholder ? def.disabledPlaceholder : allLabel;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {def.label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={def.label}
            disabled={def.disabled}
            className={cn(
              "h-9 w-full justify-between px-2.5 text-[13px] font-normal shadow-none",
              !hasValue && "text-muted-foreground",
              hasValue && "border-primary/60 bg-accent font-medium text-accent-foreground"
            )}
          >
            <span className="truncate">{hasValue ? value : placeholder}</span>
            <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            {(def.searchable ?? true) && (
              <CommandInput placeholder={`Search ${def.label.toLowerCase()}…`} />
            )}
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={allLabel}
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check className={cn(!hasValue ? "opacity-100" : "opacity-0")} />
                  {allLabel}
                </CommandItem>
                {def.options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn(value === option ? "opacity-100" : "opacity-0")} />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Search bar + Filters button + collapsible filter panel                      */
/* -------------------------------------------------------------------------- */

export function AnalyticsFilterBar({
  searchValue,
  onSearchValueChange,
  searchColumns,
  searchColumn,
  onSearchColumnChange,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  className,
}: AnalyticsFilterBarProps) {
  const [panelOpen, setPanelOpen] = React.useState(false);

  const activeFilters = filters.filter((f) => Boolean(filterValues[f.key]));
  const activeCount = activeFilters.length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("w-full", className)}>
        {/* Search row: search field (~50% width) + Filters button right after it */}
        <div className="flex items-center gap-2">
          <SearchField
            value={searchValue}
            onChange={onSearchValueChange}
            columns={searchColumns}
            column={searchColumn}
            onColumnChange={onSearchColumnChange}
          />
          <Button
            variant="outline"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-controls="analytics-filter-panel"
            className={cn(
              "h-9 shrink-0",
              panelOpen && "border-primary/60 bg-accent text-accent-foreground"
            )}
          >
            <ListFilter />
            Filters
            {activeCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-5 min-w-[20px] justify-center rounded-full px-1.5 text-[11px]"
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {panelOpen && (
          <div
            id="analytics-filter-panel"
            className="mt-3 rounded-lg border bg-muted/40 p-3 sm:p-4"
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-5">
              {filters.map((def) => (
                <FilterCombobox
                  key={def.key}
                  def={def}
                  value={filterValues[def.key] ?? ""}
                  onChange={(v) => onFilterChange(def.key, v)}
                />
              ))}
            </div>

            {/* Active filter chips + reset */}
            {activeCount > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                {activeFilters.map((def) => (
                  <Badge
                    key={def.key}
                    variant="secondary"
                    className="gap-1 rounded-md py-1 pl-2 pr-1 text-xs font-normal"
                  >
                    <span className="font-medium">{def.label}:</span>
                    {filterValues[def.key]}
                    <button
                      type="button"
                      onClick={() => onFilterChange(def.key, "")}
                      aria-label={`Remove ${def.label} filter`}
                      className="ml-0.5 rounded-sm p-0.5 transition-colors hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground"
                >
                  <X />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
