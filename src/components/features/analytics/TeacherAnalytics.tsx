"use client";

import { useEffect, useMemo, useState } from "react";
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
import { TEACHERS_QUERY } from "@/lib/graphql/queries/teachers";

type TeacherRow = {
  employeeId: string;
  nic: string | null;
  currentZonal: string | null;
  name: string | null;
  currentSchool: string | null;
  subject: string | null;
  gender: string | null;
  teacherCategory: string | null;
  medium: string | null;
  serviceYears: number | null;
};

type TeachersPayload = {
  data?: { teachers?: { total: number; totalPages: number; rows: TeacherRow[] } };
  errors?: Array<{ message: string }>;
};

type FilterKey = "subject" | "gender" | "teacherCategory" | "medium";
type FilterValues = Record<FilterKey, string>;

const columns = ["Teacher", "NIC", "School", "Zonal", "Subject", "Gender", "Category", "Medium", "Service years"];
const searchColumns: SearchColumn[] = [
  { value: "name", label: "Teacher Name" },
  { value: "nic", label: "NIC" },
  { value: "school", label: "School Name" },
  { value: "zonal", label: "Zonal Office" },
];
const emptyFilters: FilterValues = { subject: "", gender: "", teacherCategory: "", medium: "" };
const display = (value: string | number | null) => value ?? "—";

function uniqueValues(rows: TeacherRow[], key: FilterKey): string[] {
  return [...new Set(rows.map((row) => row[key]).filter((value): value is string => Boolean(value)))].sort(
    (first, second) => first.localeCompare(second),
  );
}

/** Displays live teacher records from the GraphQL API with the reporting filter UI. */
export function TeacherAnalytics() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState(searchColumns[0].value);
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 25;

  useEffect(() => {
    const abortController = new AbortController();
    async function loadTeachers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: TEACHERS_QUERY, variables: { page, limit } }),
          signal: abortController.signal,
        });
        const payload = (await response.json()) as TeachersPayload;
        if (!response.ok || payload.errors?.length || !payload.data?.teachers) {
          throw new Error(payload.errors?.[0]?.message ?? "Unable to load teachers.");
        }
        setTeachers(payload.data.teachers.rows);
        setTotal(payload.data.teachers.total);
        setTotalPages(payload.data.teachers.totalPages);
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") {
          setError(cause instanceof Error ? cause.message : "Unable to load teachers.");
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    }
    void loadTeachers();
    return () => abortController.abort();
  }, [page]);

  const filterDefinitions = useMemo<AnalyticsFilterDef[]>(
    () => [
      { key: "subject", label: "Subject", options: uniqueValues(teachers, "subject"), allLabel: "All Subjects" },
      { key: "gender", label: "Gender", options: uniqueValues(teachers, "gender"), allLabel: "All Genders" },
      { key: "teacherCategory", label: "Category", options: uniqueValues(teachers, "teacherCategory"), allLabel: "All Categories" },
      { key: "medium", label: "Medium", options: uniqueValues(teachers, "medium"), allLabel: "All Mediums" },
    ],
    [teachers],
  );

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const searchTarget =
        searchColumn === "nic"
          ? teacher.nic
          : searchColumn === "school"
            ? teacher.currentSchool
            : searchColumn === "zonal"
              ? teacher.currentZonal
              : teacher.name;
      return (
        (!query || searchTarget?.toLowerCase().includes(query)) &&
        (!filters.subject || teacher.subject === filters.subject) &&
        (!filters.gender || teacher.gender === filters.gender) &&
        (!filters.teacherCategory || teacher.teacherCategory === filters.teacherCategory) &&
        (!filters.medium || teacher.medium === filters.medium)
      );
    });
  }, [filters, search, searchColumn, teachers]);

  const exportRows = filteredTeachers.map((teacher) => [
    display(teacher.name), display(teacher.nic), display(teacher.currentSchool),
    display(teacher.currentZonal), display(teacher.subject), display(teacher.gender),
    display(teacher.teacherCategory), display(teacher.medium), display(teacher.serviceYears),
  ]);

  const updateFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key as FilterKey]: value }));
  };

  return (
    <div className="w-full">
      <Card>
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Teacher Analytics</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading ? "Loading teachers…" : `${filteredTeachers.length} shown from ${total.toLocaleString()} active teachers`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" disabled={loading} onClick={() => excelExport("teacher-analytics", [columns, ...exportRows])}>
              <Download /> Excel (page)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => printHtml("Teacher Analytics", `<table><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>${exportRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table>`)}
            >
              <Download /> PDF (page)
            </Button>
          </div>
        </div>

        <div className="border-b px-5 py-3">
          <AnalyticsFilterBar
            searchValue={search}
            onSearchValueChange={setSearch}
            searchColumns={searchColumns}
            searchColumn={searchColumn}
            onSearchColumnChange={setSearchColumn}
            filters={filterDefinitions}
            filterValues={filters}
            onFilterChange={updateFilter}
            onClearFilters={() => setFilters(emptyFilters)}
          />
        </div>

        <CardContent className="p-0">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">Loading teacher data…</TableCell></TableRow>}
              {!loading && error && <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-destructive">{error}</TableCell></TableRow>}
              {!loading && !error && filteredTeachers.map((teacher) => (
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
              {!loading && !error && filteredTeachers.length === 0 && <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">No teachers match your search or filters on this page.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(totalPages, 1)}. Search and filters apply to the displayed page.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={loading || page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={loading || page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
