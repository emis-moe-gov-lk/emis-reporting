"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { retireGeo } from "@/lib/mock/geo";
import { retirementRows, bandFor, serviceBands } from "@/lib/mock/retirement";
import { excelExport, printHtml } from "@/lib/exportHelpers";

const columns = [
  "Teacher",
  "NIC / DOB",
  "Province",
  "Zonal",
  "School",
  "Service years",
  "Service band",
  "55 completed date",
];

export function RetirementReport() {
  const filters = useActiveFilters();
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [zonal, setZonal] = useState("");
  const [school, setSchool] = useState("");
  const [band, setBand] = useState("");

  const provinces = Object.keys(retireGeo);
  const zones = province ? Object.keys(retireGeo[province]) : [];
  const schools = province && zonal ? retireGeo[province][zonal] : [];

  const filterDefs: FilterDef[] = [
    { key: "province", label: "Province" },
    { key: "zonal", label: "Zonal", disabled: !province },
    { key: "school", label: "School", disabled: !zonal },
    { key: "band", label: "Service band" },
  ];

  function removeFilter(key: string) {
    if (key === "province") {
      setProvince("");
      setZonal("");
      setSchool("");
      filters.removeMany(["province", "zonal", "school"]);
      return;
    }
    if (key === "zonal") {
      setZonal("");
      setSchool("");
      filters.removeMany(["zonal", "school"]);
      return;
    }
    if (key === "school") setSchool("");
    if (key === "band") setBand("");
    filters.remove(key);
  }

  // ---- Row filtering: search (name/NIC/school) + added filters ----
  const query = search.trim().toLowerCase();
  const filteredRows = retirementRows.filter((r) => {
    const matchesSearch =
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.nic.toLowerCase().includes(query) ||
      r.school.toLowerCase().includes(query);
    return (
      matchesSearch &&
      (!province || r.province === province) &&
      (!zonal || r.zonal === zonal) &&
      (!school || r.school === school) &&
      (!band || bandFor(r.serviceYears) === band)
    );
  });

  function fullRows() {
    return filteredRows.map((r) => [
      r.name,
      r.nic,
      r.dob,
      r.province,
      r.zonal,
      r.school,
      r.serviceYears,
      bandFor(r.serviceYears),
      r.date55,
    ]);
  }

  const handleExcelExport = () => {
    excelExport("retirement", [
      [
        "Teacher",
        "NIC",
        "DOB",
        "Province",
        "Zonal",
        "School",
        "Service years",
        "Service band",
        "55 completed date",
      ],
      ...fullRows(),
    ]);
  };

  const handlePdfExport = () => {
    printHtml(
      "Retirement Report",
      `
        <table>
          <tr>
            <th>Teacher name</th>
            <th>NIC</th>
            <th>DOB</th>
            <th>Current zonal</th>
            <th>Current school</th>
            <th>55 completed date</th>
          </tr>
          ${filteredRows
            .map(
              (r) => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.nic}</td>
                  <td>${r.dob}</td>
                  <td>${r.zonal}</td>
                  <td>${r.school}</td>
                  <td>${r.date55}</td>
                </tr>
              `
            )
            .join("")}
        </table>
      `
    );
  };

  return (
    <div className="w-full">
      <Card>
        {/* Header: title + exports */}
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Teachers approaching retirement
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredRows.length} teachers · grouped by 5-year service bands
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
          searchPlaceholder="Search by teacher name, NIC or school…"
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
                onChange={(v) => {
                  setProvince(v);
                  setZonal("");
                  setSchool("");
                }}
                options={provinces}
                onRemove={() => removeFilter("province")}
              />
            )}
            {filters.active.includes("zonal") && (
              <ActiveFilterSelect
                label="Zonal"
                value={zonal}
                onChange={(v) => {
                  setZonal(v);
                  setSchool("");
                }}
                options={zones}
                onRemove={() => removeFilter("zonal")}
              />
            )}
            {filters.active.includes("school") && (
              <ActiveFilterSelect
                label="School"
                value={school}
                onChange={setSchool}
                options={schools}
                onRemove={() => removeFilter("school")}
              />
            )}
            {filters.active.includes("band") && (
              <ActiveFilterSelect
                label="Service band"
                value={band}
                onChange={setBand}
                options={serviceBands}
                onRemove={() => removeFilter("band")}
              />
            )}
          </ActiveFiltersRow>
        )}

        {/* Data table — the primary focus */}
        <CardContent className="p-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r) => (
                <TableRow key={r.nic}>
                  <TableCell className="font-medium text-foreground">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.nic}
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground/80">
                      DOB {r.dob}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.province}</TableCell>
                  <TableCell className="text-muted-foreground">{r.zonal}</TableCell>
                  <TableCell className="text-muted-foreground">{r.school}</TableCell>
                  <TableCell className="text-muted-foreground">{r.serviceYears}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {bandFor(r.serviceYears)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date55}</TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No teachers match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing teachers approaching retirement based on service years and the
            calculated 55 completed date.
          </p>
        </div>
      </Card>
    </div>
  );
}
