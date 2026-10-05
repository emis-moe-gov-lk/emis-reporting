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
  AnalyticsFilterBar,
  type AnalyticsFilterDef,
  type SearchColumn,
} from "@/components/ui/analytics-filters";
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

/** Columns the search box can target — the first entry is the default. */
const searchColumns: SearchColumn[] = [
  { value: "name", label: "Teacher Name" },
  { value: "nic", label: "NIC" },
  { value: "school", label: "School Name" },
];

export function RetirementReport() {
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState(searchColumns[0].value);
  const [province, setProvince] = useState("");
  const [zonal, setZonal] = useState("");
  const [school, setSchool] = useState("");
  const [band, setBand] = useState("");

  // ---- Geographic cascade: province -> zonal -> school ----
  const provinces = Object.keys(retireGeo);
  const zones = province ? Object.keys(retireGeo[province]) : [];
  const schools = province && zonal ? retireGeo[province][zonal] : [];

  const filterDefs: AnalyticsFilterDef[] = [
    { key: "province", label: "Province", options: provinces, allLabel: "All Provinces" },
    {
      key: "zonal",
      label: "Zonal",
      options: zones,
      allLabel: "All Zonals",
      disabled: !province,
      disabledPlaceholder: "Select Province first",
    },
    {
      key: "school",
      label: "School",
      options: schools,
      allLabel: "All Schools",
      disabled: !zonal,
      disabledPlaceholder: "Select Zonal first",
    },
    // Independent of the geographic hierarchy.
    { key: "band", label: "Service band", options: serviceBands, allLabel: "All Bands" },
  ];

  const filterValues: Record<string, string> = { province, zonal, school, band };

  /** Changing a geographic level clears every level below it, never the band. */
  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case "province":
        setProvince(value);
        setZonal("");
        setSchool("");
        break;
      case "zonal":
        setZonal(value);
        setSchool("");
        break;
      case "school":
        setSchool(value);
        break;
      case "band":
        setBand(value);
        break;
    }
  };

  const clearFilters = () => {
    setProvince("");
    setZonal("");
    setSchool("");
    setBand("");
  };

  // ---- Row filtering: column-targeted search + geo cascade + band ----
  const query = search.trim().toLowerCase();
  const filteredRows = retirementRows.filter((r) => {
    const searchTarget =
      searchColumn === "nic" ? r.nic : searchColumn === "school" ? r.school : r.name;
    const matchesSearch = !query || searchTarget.toLowerCase().includes(query);
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

        {/*
          Search & filter bar — same pattern as Teacher Analytics: single search
          field with in-field column chooser, Filters button, and a collapsible
          panel holding the Province → Zonal → School cascade plus the
          independent Service band filter.
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
