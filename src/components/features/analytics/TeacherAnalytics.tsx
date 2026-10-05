"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useCascadingGeo } from "./useCascadingGeo";
import { geoHierarchy } from "@/lib/mock/geo";
import { teachers } from "@/lib/mock/teachers";
import { excelExport, printHtml } from "@/lib/exportHelpers";
import { TEACHERS_QUERY } from "@/lib/graphql/queries/teachers";

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

const GEO_KEYS = ["province", "district", "zonal", "divisional", "school"] as const;

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
  firstServiceDate: string | null;
  serviceYears: number | null;
};

type TeachersPayload = {
  data?: {
    teachers?: {
      total: number;
      totalPages: number;
      rows: TeacherRow[];
    };
  };
  errors?: Array<{ message: string }>;
};

const liveColumns = [
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

const display = (value: string | number | null) => value ?? "—";

/** Displays live teacher records loaded from the GraphQL API. */
export function TeacherAnalytics() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) =>
      [teacher.name, teacher.nic, teacher.currentSchool, teacher.currentZonal]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, teachers]);

  const exportRows = filteredTeachers.map((teacher) => [
    display(teacher.name), display(teacher.nic), display(teacher.currentSchool),
    display(teacher.currentZonal), display(teacher.subject), display(teacher.gender),
    display(teacher.teacherCategory), display(teacher.medium), display(teacher.serviceYears),
  ]);

  return (
    <div className="w-full">
      <Card>
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Teacher Analytics</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading ? "Loading teachers…" : `${total.toLocaleString()} active teachers`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" disabled={loading} onClick={() => excelExport("teacher-analytics", [liveColumns, ...exportRows])}>
              <Download /> Excel (page)
            </Button>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => printHtml("Teacher Analytics", `<table><tr>${liveColumns.map((column) => `<th>${column}</th>`).join("")}</tr>${exportRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</table>`)}>
              <Download /> PDF (page)
            </Button>
          </div>
        </div>

        <TableToolbar searchPlaceholder="Search this page by name, NIC, school or zonal…" searchValue={search} onSearchChange={setSearch} filters={[]} active={[]} onAddFilter={() => undefined} />

        <CardContent className="p-0">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {liveColumns.map((column) => <TableHead key={column}>{column}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={liveColumns.length} className="py-10 text-center text-muted-foreground">Loading teacher data…</TableCell></TableRow>}
              {!loading && error && <TableRow><TableCell colSpan={liveColumns.length} className="py-10 text-center text-destructive">{error}</TableCell></TableRow>}
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
              {!loading && !error && filteredTeachers.length === 0 && <TableRow><TableCell colSpan={liveColumns.length} className="py-10 text-center text-muted-foreground">No teachers match your search on this page.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(totalPages, 1)}. Search applies to the displayed page.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={loading || page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={loading || page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Legacy mock-data view retained temporarily while its filter UI is redesigned for database filters. */
function MockTeacherAnalytics() {
  const geo = useCascadingGeo(geoHierarchy);
  const filters = useActiveFilters();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [medium, setMedium] = useState("");

  const provinces = Object.keys(geoHierarchy);

  // ---- Available filters for the "+ Add Filter" menu (cascade-gated) ----
  const filterDefs: FilterDef[] = [
    { key: "province", label: "Province" },
    { key: "district", label: "District", disabled: !geo.values.province },
    { key: "zonal", label: "Zonal", disabled: !geo.values.district },
    { key: "divisional", label: "Divisional", disabled: !geo.values.zonal },
    { key: "school", label: "School", disabled: !geo.values.divisional },
    { key: "subject", label: "Subject", disabled: !geo.values.district },
    { key: "gender", label: "Gender", disabled: !geo.values.district },
    { key: "category", label: "Category", disabled: !geo.values.district },
    { key: "medium", label: "Medium", disabled: !geo.values.district },
  ];

  // ---- Removal: clearing a geo level cascades through its children ----
  function removeGeo(key: string) {
    const idx = GEO_KEYS.indexOf(key as (typeof GEO_KEYS)[number]);
    const drop = GEO_KEYS.slice(idx);
    if (key === "province") geo.setProvince("");
    if (key === "district") geo.setDistrict("");
    if (key === "zonal") geo.setZonal("");
    if (key === "divisional") geo.setDivisional("");
    if (key === "school") geo.setSchool("");
    filters.removeMany(drop);
  }

  // ---- Dynamic title from the selected geographic filters ----
  const titleParts = [
    geo.values.province,
    geo.values.district,
    geo.values.zonal,
    geo.values.divisional,
    geo.values.school,
  ].filter(Boolean);
  const title = titleParts.length > 0 ? titleParts.join(" - ") : "All Provinces";

  // ---- Row filtering: search + attribute filters ----
  const query = search.trim().toLowerCase();
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      t.nic.toLowerCase().includes(query) ||
      t.school.toLowerCase().includes(query);
    return (
      matchesSearch &&
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

  const hasActiveFilters = filters.active.length > 0;

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
        {hasActiveFilters && (
          <ActiveFiltersRow>
            {filters.active.includes("province") && (
              <ActiveFilterSelect
                label="Province"
                value={geo.values.province}
                onChange={geo.setProvince}
                options={provinces}
                onRemove={() => removeGeo("province")}
              />
            )}
            {filters.active.includes("district") && (
              <ActiveFilterSelect
                label="District"
                value={geo.values.district}
                onChange={geo.setDistrict}
                options={geo.options.districts}
                onRemove={() => removeGeo("district")}
              />
            )}
            {filters.active.includes("zonal") && (
              <ActiveFilterSelect
                label="Zonal"
                value={geo.values.zonal}
                onChange={geo.setZonal}
                options={geo.options.zones}
                onRemove={() => removeGeo("zonal")}
              />
            )}
            {filters.active.includes("divisional") && (
              <ActiveFilterSelect
                label="Divisional"
                value={geo.values.divisional}
                onChange={geo.setDivisional}
                options={geo.options.divisions}
                onRemove={() => removeGeo("divisional")}
              />
            )}
            {filters.active.includes("school") && (
              <ActiveFilterSelect
                label="School"
                value={geo.values.school}
                onChange={geo.setSchool}
                options={geo.options.schools}
                onRemove={() => removeGeo("school")}
              />
            )}
            {filters.active.includes("subject") && (
              <ActiveFilterSelect
                label="Subject"
                value={subject}
                onChange={setSubject}
                options={["Mathematics", "Science", "English"]}
                onRemove={() => {
                  setSubject("");
                  filters.remove("subject");
                }}
              />
            )}
            {filters.active.includes("gender") && (
              <ActiveFilterSelect
                label="Gender"
                value={gender}
                onChange={setGender}
                options={["Female", "Male"]}
                onRemove={() => {
                  setGender("");
                  filters.remove("gender");
                }}
              />
            )}
            {filters.active.includes("category") && (
              <ActiveFilterSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={["1AB", "1C"]}
                onRemove={() => {
                  setCategory("");
                  filters.remove("category");
                }}
              />
            )}
            {filters.active.includes("medium") && (
              <ActiveFilterSelect
                label="Medium"
                value={medium}
                onChange={setMedium}
                options={["Sinhala", "Tamil", "English"]}
                onRemove={() => {
                  setMedium("");
                  filters.remove("medium");
                }}
              />
            )}
          </ActiveFiltersRow>
        )}

        {/* Data table — the primary focus */}
        <CardContent className="p-0">
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
            Setting Zonal or Divisional above narrows this same list further — it always
            shows individual teachers, never a summary row.
          </p>
        </div>
      </Card>
    </div>
  );
}
