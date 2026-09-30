"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableToolbar,
  ActiveFiltersRow,
  ActiveFilterSelect,
  useActiveFilters,
  FilterDef,
} from "@/components/ui/table-toolbar";
import { cadreReports } from "@/lib/mock/cadre";
import { GenericRow } from "@/types";
import { excelExport, printHtml } from "@/lib/exportHelpers";

type Key = "cadre" | "vacancy" | "surplus" | "ratio";

const PROVINCES = ["Western", "Central", "Southern", "North Western"];
const ZONALS = ["Colombo", "Homagama", "Piliyandala", "Galle", "Kandy", "Kurunegala", "Negombo"];

function pillKind(v: string | number): "success" | "destructive" | null {
  const s = String(v).trim();
  if (s.startsWith("+") || s === "100%") return "success";
  if (s.startsWith("-")) return "destructive";
  return null;
}

function distinct(values: (string | number)[]): string[] {
  return Array.from(new Set(values.map(String)));
}

/** True when any cell of the row contains the value (case-insensitive). */
function rowContains(row: GenericRow, value: string): boolean {
  const v = value.toLowerCase();
  return Object.values(row).some((cell) => String(cell).toLowerCase().includes(v));
}

export function CadreTabs() {
  const [key, setKey] = useState<Key>("cadre");
  const [search, setSearch] = useState("");
  const filters = useActiveFilters();
  const [values, setValues] = useState<Record<string, string>>({});

  const report = cadreReports[key];

  const filterDefs: FilterDef[] = report.filters.map((f) => ({ key: f, label: f }));

  function switchTab(value: string) {
    setKey(value as Key);
    setSearch("");
    filters.reset();
    setValues({});
  }

  function setFilterValue(filterKey: string, value: string) {
    setValues((prev) => ({ ...prev, [filterKey]: value }));
  }

  function removeFilter(filterKey: string) {
    setValues((prev) => ({ ...prev, [filterKey]: "" }));
    filters.remove(filterKey);
  }

  /** Options for a filter: distinct column values, or static lists for geo filters. */
  function optionsFor(filter: string): string[] {
    if (report.cols.includes(filter)) {
      return distinct(report.rows.map((row) => row[filter]));
    }
    if (filter === "Province") return PROVINCES;
    if (filter === "Zonal") return ZONALS;
    return [];
  }

  // ---- Row filtering: search by school name + added filters ----
  const query = search.trim().toLowerCase();
  const schoolColumn = report.cols.includes("School") ? "School" : "Level";
  const filteredRows = report.rows.filter((row) => {
    const matchesSearch =
      !query || String(row[schoolColumn] ?? "").toLowerCase().includes(query);
    const matchesFilters = report.filters.every(
      (f) => !values[f] || rowContains(row, values[f])
    );
    return matchesSearch && matchesFilters;
  });

  const exportRows = filteredRows.map((row) => report.cols.map((column) => row[column]));

  const handleExcelExport = () => {
    excelExport(key, [report.cols, ...exportRows]);
  };

  const handlePdfExport = () => {
    const tableHtml = `
      <table>
        <tr>
          ${report.cols.map((column) => `<th>${column}</th>`).join("")}
        </tr>
        ${filteredRows
          .map(
            (row) => `
              <tr>
                ${report.cols.map((column) => `<td>${row[column]}</td>`).join("")}
              </tr>
            `
          )
          .join("")}
      </table>
    `;

    printHtml(report.title, tableHtml);
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <Tabs value={key} onValueChange={switchTab}>
        <TabsList>
          <TabsTrigger value="cadre">Cadre vs Filled Posts</TabsTrigger>
          <TabsTrigger value="vacancy">Vacancy (Ageing)</TabsTrigger>
          <TabsTrigger value="surplus">Surplus &amp; Deficit</TabsTrigger>
          <TabsTrigger value="ratio">Teacher–Student Ratio</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Single container: header, search/filters, table */}
      <Card>
        {/* Header: title + exports */}
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{report.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredRows.length} rows shown (sample)
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExcelExport}>
              <Download />
              Excel (all)
            </Button>

            <Button variant="outline" size="sm" onClick={handlePdfExport}>
              <Download />
              PDF (all)
            </Button>
          </div>
        </div>

        {/* Search (left) + Add Filter (right) */}
        <TableToolbar
          searchPlaceholder="Search by school name…"
          searchValue={search}
          onSearchChange={setSearch}
          filters={filterDefs}
          active={filters.active}
          onAddFilter={filters.add}
        />

        {/* Added filters */}
        {filters.active.length > 0 && (
          <ActiveFiltersRow>
            {report.filters
              .filter((f) => filters.active.includes(f))
              .map((f) => (
                <ActiveFilterSelect
                  key={f}
                  label={f}
                  value={values[f] ?? ""}
                  onChange={(v) => setFilterValue(f, v)}
                  options={optionsFor(f)}
                  onRemove={() => removeFilter(f)}
                />
              ))}
          </ActiveFiltersRow>
        )}

        {/* Data table — the primary focus */}
        <CardContent className="p-0">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {report.cols.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row, index) => (
                <TableRow key={index}>
                  {report.cols.map((column) => {
                    const kind = column === report.statusCol ? pillKind(row[column]) : null;

                    return (
                      <TableCell key={column} className="text-muted-foreground">
                        {kind ? <Badge variant={kind}>{row[column]}</Badge> : row[column]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={report.cols.length}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No rows match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {filteredRows.length} sample rows for this report.
          </p>
        </div>
      </Card>
    </div>
  );
}
