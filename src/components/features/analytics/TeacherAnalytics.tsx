"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AnalyticsFilterBar,
  type AnalyticsFilterDef,
  type SearchColumn,
} from "@/components/ui/analytics-filters";
import { excelExport, printHtml } from "@/lib/exportHelpers";
import { teachers as mockTeachers } from "@/lib/mock/teachers";

type TeacherRow = {
  employeeId: string;
  nic: string;
  currentZonal: string;
  name: string;
  currentSchool: string;
  subject: string;
  gender: string;
  teacherCategory: string;
  medium: string;
  serviceYears: number;
  province: string;
  district: string;
  divisional: string;
};

type FilterKey =
  | "province"
  | "district"
  | "zonal"
  | "divisional"
  | "school"
  | "subject"
  | "gender"
  | "teacherCategory"
  | "medium";
type FilterValues = Record<FilterKey, string>;

const columns = ["Teacher", "NIC", "School", "Zonal", "Subject", "Gender", "Category", "Medium", "Service years"];
const searchColumns: SearchColumn[] = [
  { value: "name", label: "Teacher Name" },
  { value: "nic", label: "NIC" },
  { value: "school", label: "School Name" },
  { value: "zonal", label: "Zonal Office" },
];
const emptyFilters: FilterValues = {
  province: "",
  district: "",
  zonal: "",
  divisional: "",
  school: "",
  subject: "",
  gender: "",
  teacherCategory: "",
  medium: "",
};
const filterKeys = Object.keys(emptyFilters) as FilterKey[];
const display = (value: string | number | null) => value ?? "—";
const limit = 25;

const teacherRows: TeacherRow[] = mockTeachers.map((teacher) => ({
  employeeId: teacher.nic,
  nic: teacher.nic,
  currentZonal: teacher.zonal,
  name: teacher.name,
  currentSchool: teacher.school,
  subject: teacher.subject,
  gender: teacher.gender,
  teacherCategory: teacher.category,
  medium: teacher.medium,
  serviceYears: teacher.serviceYears,
  province: teacher.province ?? "",
  district: teacher.district ?? "",
  divisional: teacher.divisional ?? "",
}));

const filterValue = (teacher: TeacherRow, key: FilterKey) => {
  switch (key) {
    case "zonal": return teacher.currentZonal;
    case "school": return teacher.currentSchool;
    case "teacherCategory": return teacher.teacherCategory;
    default: return teacher[key];
  }
};

export function TeacherAnalytics() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState(searchColumns[0].value);
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);

  const filterOptions = useMemo(() => {
    return Object.fromEntries(
      filterKeys.map((key) => {
        const options = teacherRows
          .filter((teacher) => filterKeys.every((otherKey) =>
            otherKey === key || !filters[otherKey] || filterValue(teacher, otherKey) === filters[otherKey],
          ))
          .map((teacher) => filterValue(teacher, key))
          .filter(Boolean);
        return [key, [...new Set(options)].sort((a, b) => a.localeCompare(b))];
      }),
    ) as Record<FilterKey, string[]>;
  }, [filters]);

  const filterDefinitions = useMemo<AnalyticsFilterDef[]>(
    () => [
      { key: "province", label: "Province", options: filterOptions.province, allLabel: "All Provinces" },
      { key: "district", label: "District", options: filterOptions.district, allLabel: "All Districts", disabled: !filters.province, disabledPlaceholder: "Select Province first" },
      { key: "zonal", label: "Zonal", options: filterOptions.zonal, allLabel: "All Zonals", disabled: !filters.district, disabledPlaceholder: "Select District first" },
      { key: "divisional", label: "Divisional", options: filterOptions.divisional, allLabel: "All Divisionals", disabled: !filters.zonal, disabledPlaceholder: "Select Zonal first" },
      { key: "school", label: "School", options: filterOptions.school, allLabel: "All Schools", disabled: !filters.divisional, disabledPlaceholder: "Select Divisional first" },
      { key: "subject", label: "Subject", options: filterOptions.subject, allLabel: "All Subjects" },
      { key: "gender", label: "Gender", options: filterOptions.gender, allLabel: "All Genders" },
      { key: "teacherCategory", label: "Category", options: filterOptions.teacherCategory, allLabel: "All Categories" },
      { key: "medium", label: "Medium", options: filterOptions.medium, allLabel: "All Mediums" },
    ],
    [filterOptions, filters.district, filters.divisional, filters.province, filters.zonal],
  );

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teacherRows.filter((teacher) => {
      const matchesFilters = filterKeys.every((key) => !filters[key] || filterValue(teacher, key) === filters[key]);
      const searchTarget = searchColumn === "nic"
        ? teacher.nic
        : searchColumn === "school"
          ? teacher.currentSchool
          : searchColumn === "zonal"
            ? teacher.currentZonal
            : teacher.name;
      return matchesFilters && (!query || searchTarget.toLowerCase().includes(query));
    });
  }, [filters, search, searchColumn]);

  const totalPages = Math.ceil(filteredTeachers.length / limit);
  const pageTeachers = filteredTeachers.slice((page - 1) * limit, page * limit);
  const exportRows = pageTeachers.map((teacher) => [
    display(teacher.name), display(teacher.nic), display(teacher.currentSchool),
    display(teacher.currentZonal), display(teacher.subject), display(teacher.gender),
    display(teacher.teacherCategory), display(teacher.medium), display(teacher.serviceYears),
  ]);

  const updateFilter = (key: string, value: string) => {
    setFilters((current) => {
      const next = { ...current, [key as FilterKey]: value };
      if (key === "province") Object.assign(next, { district: "", zonal: "", divisional: "", school: "" });
      if (key === "district") Object.assign(next, { zonal: "", divisional: "", school: "" });
      if (key === "zonal") Object.assign(next, { divisional: "", school: "" });
      if (key === "divisional") next.school = "";
      return next;
    });
    setPage(1);
  };

  return (
    <div className="w-full">
      <Card>
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Teacher Analytics</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing {pageTeachers.length} of {filteredTeachers.length} matching sample teachers
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => excelExport("teacher-analytics", [columns, ...exportRows])}>
              <Download /> Excel (page)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => printHtml("Teacher Analytics", `<table><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>${exportRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table>`)}
            >
              <Download /> PDF (page)
            </Button>
          </div>
        </div>

        <div className="border-b px-5 py-3">
          <AnalyticsFilterBar
            searchValue={search}
            onSearchValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchColumns={searchColumns}
            searchColumn={searchColumn}
            onSearchColumnChange={(value) => {
              setSearchColumn(value);
              setPage(1);
            }}
            filters={filterDefinitions}
            filterValues={filters}
            onFilterChange={updateFilter}
            onClearFilters={() => {
              setFilters(emptyFilters);
              setPage(1);
            }}
          />
        </div>

        <CardContent className="overflow-x-auto p-0">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageTeachers.map((teacher) => (
                <TableRow key={teacher.employeeId}>
                  <TableCell className="font-medium text-foreground">{display(teacher.name)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.nic)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.currentSchool)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.currentZonal)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.subject)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.gender)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.teacherCategory)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.medium)}</TableCell>
                  <TableCell className="text-muted-foreground">{display(teacher.serviceYears)}</TableCell>
                </TableRow>
              ))}
              {pageTeachers.length === 0 && <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">No teachers match your search or filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(totalPages, 1)}. Showing local sample data.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
