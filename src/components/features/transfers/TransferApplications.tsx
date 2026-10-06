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
  AnalyticsFilterBar,
  type AnalyticsFilterDef,
  type SearchColumn,
} from "@/components/ui/analytics-filters";
import { transferData } from "@/lib/mock/transfers";
import { TransferKind, TransferApplication } from "@/types";
import { excelExport, printHtml } from "@/lib/exportHelpers";
import { TransferDrawer } from "./TransferDrawer";

const titles: Record<TransferKind, string> = {
  interzonal: "Inter-zonal transfer applications",
  anotherzonal: "Another zonal transfer applications",
  interprov: "Inter-provincial transfer applications",
};

const statusBadge: Record<
  TransferApplication["status"],
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  full: { label: "Full", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  pending: { label: "Pending", variant: "destructive" },
};

const STATUS_OPTIONS = ["Full", "Partial", "Pending"];
const PROVINCE_OPTIONS = ["Western", "Central", "Southern"];
const ZONAL_OPTIONS = ["Colombo", "Homagama", "Piliyandala", "Kandy", "Galle", "Negombo", "Kurunegala"];

/** Columns the search box can target — the first entry is the default. */
const searchColumns: SearchColumn[] = [
  { value: "name", label: "Teacher Name" },
  { value: "nic", label: "NIC" },
  { value: "school", label: "School Name" },
  { value: "id", label: "Application ID" },
];

export function TransferApplications() {
  const [tab, setTab] = useState<TransferKind>("interzonal");
  const [selected, setSelected] = useState<TransferApplication | null>(null);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState(searchColumns[0].value);
  const [province, setProvince] = useState("");
  const [zonal, setZonal] = useState("");
  const [status, setStatus] = useState("");

  const data = transferData[tab];

  // ---- Available filters per tab ----
  const filterDefs: AnalyticsFilterDef[] = [
    ...(tab === "interprov"
      ? [{ key: "province", label: "Province", options: PROVINCE_OPTIONS, allLabel: "All Provinces" }]
      : []),
    ...(tab !== "interzonal"
      ? [{ key: "zonal", label: "Zonal", options: ZONAL_OPTIONS, allLabel: "All Zonals" }]
      : []),
    { key: "status", label: "Status", options: STATUS_OPTIONS, allLabel: "All Statuses" },
  ];

  const filterValues: Record<string, string> = { province, zonal, status };

  function switchTab(value: string) {
    setTab(value as TransferKind);
    setProvince("");
    setZonal("");
    setStatus("");
  }

  const handleFilterChange = (key: string, value: string) => {
    if (key === "province") setProvince(value);
    if (key === "zonal") setZonal(value);
    if (key === "status") setStatus(value);
  };

  const clearFilters = () => {
    setProvince("");
    setZonal("");
    setStatus("");
  };

  // ---- Row filtering: column-targeted search + filters ----
  const query = search.trim().toLowerCase();
  const filteredRows = data.rows.filter((r) => {
    const searchTarget =
      searchColumn === "nic"
        ? r.nic
        : searchColumn === "school"
          ? r.currentSchool
          : searchColumn === "id"
            ? r.id
            : r.name;
    const matchesSearch = !query || searchTarget.toLowerCase().includes(query);
    return (
      matchesSearch &&
      (!province || r.targetProvince === province) &&
      (!zonal || r.targetZone === zonal) &&
      (!status || statusBadge[r.status].label === status)
    );
  });

  function excelRows() {
    const cols = ["Application ID", ...data.cols.slice(0, -1), "Target schools"];

    const rows = filteredRows.map((r) => [
      r.id,
      r.name,
      `${r.nic} / ${r.dob}`,
      `${r.currentSchool} (${r.currentZone})`,
      `${r.subject} / ${r.apptSubject}`,
      r.serviceYears,
      ...(r.targetProvince ? [r.targetProvince] : []),
      ...(r.targetZone ? [r.targetZone] : []),
      r.schools.join("; "),
    ]);

    return [cols, ...rows];
  }

  const handleExcelExport = () => {
    excelExport(`${tab}-transfers`, excelRows());
  };

  const handlePdfExport = () => {
    printHtml(
      titles[tab],
      `
        <table>
          <tr>
            ${data.cols.map((column) => `<th>${column}</th>`).join("")}
          </tr>
          ${filteredRows
            .map(
              (r) => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.nic} / ${r.dob}</td>
                  <td>${r.currentSchool} (${r.currentZone})</td>
                  <td>${r.subject} / ${r.apptSubject}</td>
                  <td>${r.serviceYears}</td>
                  ${r.targetProvince ? `<td>${r.targetProvince}</td>` : ""}
                  ${r.targetZone ? `<td>${r.targetZone}</td>` : ""}
                  <td>${r.schools.length} schools</td>
                  <td>${r.status}</td>
                </tr>
              `
            )
            .join("")}
        </table>
      `
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs — scrolls horizontally on small screens */}
      <Tabs value={tab} onValueChange={switchTab}>
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="interzonal">Inter-Zonal</TabsTrigger>
            <TabsTrigger value="anotherzonal">Another Zonal</TabsTrigger>
            <TabsTrigger value="interprov">Another-Provincial</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Single container: header, search/filters, table */}
      <Card>
        {/* Header: title + exports */}
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{titles[tab]}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredRows.length} applications · click a row for full detail
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

        {/*
          Search & filter bar — same pattern as Teacher Analytics: single search
          field with in-field column chooser, Filters button, and a collapsible
          panel holding this tab's filters.
        */}
        <div className="border-b px-5 py-3">
          <AnalyticsFilterBar
            searchValue={search}
            onSearchValueChange={setSearch}
            searchColumns={searchColumns}
            searchColumn={searchColumn}
            onSearchColumnChange={setSearchColumn}
            filters={filterDefs}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Data table — the primary focus (scrolls horizontally on small screens) */}
        <CardContent className="overflow-x-auto p-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Application ID</TableHead>
                {data.cols.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r) => (
                <TableRow key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      Appt. {r.currentDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.nic}
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
                      DOB {r.dob}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.currentSchool}
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
                      {r.currentZone} zone
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.subject}
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
                      Teaching: {r.apptSubject}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.serviceYears}</TableCell>
                  {r.targetProvince && (
                    <TableCell className="text-muted-foreground">{r.targetProvince}</TableCell>
                  )}
                  {r.targetZone && (
                    <TableCell className="text-muted-foreground">{r.targetZone}</TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {r.schools.length} schools
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[r.status].variant}>
                      {statusBadge[r.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={data.cols.length + 1}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No applications match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Click any transfer application to view the complete application details.
          </p>
        </div>
      </Card>

      {/* Transfer detail drawer */}
      {selected && <TransferDrawer app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
