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

export function TransferApplications() {
  const [tab, setTab] = useState<TransferKind>("interzonal");
  const [selected, setSelected] = useState<TransferApplication | null>(null);
  const [search, setSearch] = useState("");
  const filters = useActiveFilters();
  const [province, setProvince] = useState("");
  const [zonal, setZonal] = useState("");
  const [status, setStatus] = useState("");

  const data = transferData[tab];

  // ---- Available filters per tab ("+ Add Filter" menu) ----
  const filterDefs: FilterDef[] = [
    ...(tab === "interprov" ? [{ key: "province", label: "Province" }] : []),
    ...(tab !== "interzonal" ? [{ key: "zonal", label: "Zonal" }] : []),
    { key: "status", label: "Status" },
  ];

  function switchTab(value: string) {
    setTab(value as TransferKind);
    filters.reset();
    setProvince("");
    setZonal("");
    setStatus("");
  }

  function removeFilter(key: string) {
    if (key === "province") setProvince("");
    if (key === "zonal") setZonal("");
    if (key === "status") setStatus("");
    filters.remove(key);
  }

  // ---- Row filtering: search (name/NIC/school/application ID) + filters ----
  const query = search.trim().toLowerCase();
  const filteredRows = data.rows.filter((r) => {
    const matchesSearch =
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.nic.toLowerCase().includes(query) ||
      r.currentSchool.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query);
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
      {/* Tabs */}
      <Tabs value={tab} onValueChange={switchTab}>
        <TabsList>
          <TabsTrigger value="interzonal">Inter-Zonal</TabsTrigger>
          <TabsTrigger value="anotherzonal">Another Zonal</TabsTrigger>
          <TabsTrigger value="interprov">Inter-Provincial</TabsTrigger>
        </TabsList>
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

        {/* Search (left) + Add Filter (right) */}
        <TableToolbar
          searchPlaceholder="Search by name, NIC, school or application ID…"
          searchValue={search}
          onSearchChange={setSearch}
          filters={filterDefs}
          active={filters.active}
          onAddFilter={filters.add}
        />

        {/* Added filters */}
        {filters.active.length > 0 && (
          <ActiveFiltersRow>
            {filters.active.includes("province") && (
              <ActiveFilterSelect
                label="Province"
                value={province}
                onChange={setProvince}
                options={["Western", "Central", "Southern"]}
                onRemove={() => removeFilter("province")}
              />
            )}
            {filters.active.includes("zonal") && (
              <ActiveFilterSelect
                label="Zonal"
                value={zonal}
                onChange={setZonal}
                options={["Colombo", "Homagama", "Piliyandala", "Kandy", "Galle", "Negombo", "Kurunegala"]}
                onRemove={() => removeFilter("zonal")}
              />
            )}
            {filters.active.includes("status") && (
              <ActiveFilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
                onRemove={() => removeFilter("status")}
              />
            )}
          </ActiveFiltersRow>
        )}

        {/* Data table — the primary focus */}
        <CardContent className="p-0">
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
