import type { Employee } from "@/server/models/employee.model";

export type Teacher = Employee & {
  currentSchoolId: string | null;
  currentSchool: string | null;
  currentZonalId: string | null;
  currentZonal: string | null;
  subjectId: string | null;
  subject: string | null;
  teacherCategoryId: string | null;
  teacherCategory: string | null;
  mediumId: string | null;
  medium: string | null;
  firstServiceDate: string | null;
  serviceYears: number | null;
};

export type TeacherListResult = {
  rows: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
