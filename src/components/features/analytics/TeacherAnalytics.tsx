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
import { useCascadingGeo } from "./useCascadingGeo";
import { geoHierarchy } from "@/lib/mock/geo";
import { teachers } from "@/lib/mock/teachers";
import { excelExport, printHtml } from "@/lib/exportHelpers";
import type { Teacher } from "@/types";

const columns = [
  "Teacher",
  "NIC",
  "School",
  "Zonal",
  "Subject",
  "Gender",
  "Category",
  "Medium",
  "Service years",
];

/** Columns the search box can target — the first entry is the default. */
const searchColumns: SearchColumn[] = [
  { value: "name", label: "Teacher Name" },
  { value: "nic", label: "NIC" },
  { value: "school", label: "School Name" },
];

export function TeacherAnalytics() {
  const geo = useCascadingGeo(geoHierarchy);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState(searchColumns[0].value);
  const [subject, setSubject] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [medium, setMedium] = useState("");

  const provinces = Object.keys(geoHierarchy);

  // ---- Dynamic title from the selected geographic filters ----
  const titleParts = [
    geo.values.province,
    geo.values.district,
    geo.values.zonal,
    geo.values.divisional,
    geo.values.school,
  ].filter(Boolean);
  const title = titleParts.length > 0 ? titleParts.join(" - ") : "All Provinces";

  // ---- Filter panel definition: geo cascade first, then attribute filters ----
  const filterDefs: AnalyticsFilterDef[] = [
    { key: "province", label: "Province", options: provinces, allLabel: "All Provinces" },
    {
      key: "district",
      label: "District",
      options: geo.options.districts,
      allLabel: "All Districts",
      disabled: !geo.values.province,
      disabledPlaceholder: "Select Province first",
    },
    {
      key: "zonal",
      label: "Zonal",
      options: geo.options.zones,
      allLabel: "All Zonals",
      disabled: !geo.values.district,
      disabledPlaceholder: "Select District first",
    },
    {
      key: "divisional",
      label: "Divisional",
      options: geo.options.divisions,
      allLabel: "All Divisions",
      disabled: !geo.values.zonal,
      disabledPlaceholder: "Select Zonal first",
    },
    {
      key: "school",
      label: "School",
      options: geo.options.schools,
      allLabel: "All Schools",
      disabled: !geo.values.divisional,
      disabledPlaceholder: "Select Divisional first",
    },
    // Attribute filters stay independent of the geographic hierarchy.
    { key: "subject", label: "Subject", options: ["Mathematics", "Science", "English"], allLabel: "All Subjects" },
    { key: "gender", label: "Gender", options: ["Female", "Male"], allLabel: "All Genders" },
    { key: "category", label: "Category", options: ["1AB", "1C"], allLabel: "All Categories" },
    { key: "medium", label: "Medium", options: ["Sinhala", "Tamil", "English"], allLabel: "All Mediums" },
  ];

  const filterValues: Record<string, string> = {
    province: geo.values.province,
    district: geo.values.district,
    zonal: geo.values.zonal,
    divisional: geo.values.divisional,
    school: geo.values.school,
    subject,
    gender,
    category,
    medium,
  };

  /**
   * The geo hook's setters already clear every level below the one being
   * changed; attribute filters are never touched by geographic changes.
   */
  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case "province":
        geo.setProvince(value);
        break;
      case "district":
        geo.setDistrict(value);
        break;
      case "zonal":
        geo.setZonal(value);
        break;
      case "divisional":
        geo.setDivisional(value);
        break;
      case "school":
        geo.setSchool(value);
        break;
      case "subject":
        setSubject(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "medium":
        setMedium(value);
        break;
    }
  };

  const clearFilters = () => {
    geo.setProvince(""); // cascades: clears District, Zonal, Divisional and School
    setSubject("");
    setGender("");
    setCategory("");
    setMedium("");
  };

  // ---- Row filtering: column-targeted search + geo cascade + attributes ----
  const query = search.trim().toLowerCase();

  const matchesGeo = (t: Teacher): boolean => {
    const { province, district, zonal, school } = geo.values;
    if (!province) return true;
    if (school) return t.school === school;
    // A divisional selection always sits under exactly one zonal.
    if (zonal) return t.zonal === zonal;
    const districts = geoHierarchy[province] ?? {};
    if (district) return Object.keys(districts[district] ?? {}).includes(t.zonal);
    return Object.values(districts).some((d) => Object.keys(d).includes(t.zonal));
  };

  const filteredTeachers = teachers.filter((t) => {
    const searchTarget =
      searchColumn === "nic" ? t.nic : searchColumn === "school" ? t.school : t.name;
    const matchesSearch = !query || searchTarget.toLowerCase().includes(query);
    return (
      matchesSearch &&
      matchesGeo(t) &&
      (!subject || t.subject === subject) &&
      (!gender || t.gender === gender) &&
      (!category || t.category === category) &&
      (!medium || t.medium === medium)
    );
  });

  function toRows() {
    return filteredTeachers.map((t) => [
      t.name,
      t.nic,
      t.school,
      t.zonal,
      t.subject,
      t.gender,
      t.category,
      t.medium,
      t.serviceYears,
    ]);
  }

  return (
    <div className="w-full">
      <Card>
        {/* Header: dynamic title + exports */}
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredTeachers.length} teachers match these filters
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => excelExport("teacher-analytics", [columns, ...toRows()])}
            >
              <Download />
              Excel (all)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                printHtml(
                  `Teacher Analytics — ${title}`,
                  `
                    <table>
                      <tr>
                        ${columns.map((c) => `<th>${c}</th>`).join("")}
                      </tr>
                      ${toRows()
                        .map(
                          (r) => `
                            <tr>
                              ${r.map((c) => `<td>${c}</td>`).join("")}
                            </tr>
                          `
                        )
                        .join("")}
                    </table>
                  `
                )
              }
            >
              <Download />
              PDF (all)
            </Button>
          </div>
        </div>

        {/*
          Search & filter bar — a single search field with an in-field column
          chooser, a Filters button, and a collapsible panel holding the
          Province → District → Zonal → Divisional → School cascade plus the
          independent Subject / Gender / Category / Medium filters.
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
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((t) => (
                <TableRow key={t.nic}>
                  <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.nic}</TableCell>
                  <TableCell className="text-muted-foreground">{t.school}</TableCell>
                  <TableCell className="text-muted-foreground">{t.zonal}</TableCell>
                  <TableCell className="text-muted-foreground">{t.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{t.gender}</TableCell>
                  <TableCell className="text-muted-foreground">{t.category}</TableCell>
                  <TableCell className="text-muted-foreground">{t.medium}</TableCell>
                  <TableCell className="text-muted-foreground">{t.serviceYears}</TableCell>
                </TableRow>
              ))}
              {filteredTeachers.length === 0 && (
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
            Pick a Province to unlock District, then Zonal, Divisional and School — each
            level stays visible but disabled until the one above it is selected.
          </p>
        </div>
      </Card>
    </div>
  );
}
