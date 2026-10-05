import "server-only";
import { AppError } from "@/server/errors/app-error";
import type { Teacher, TeacherListResult } from "@/server/models/teacher.model";
import {
  countActiveTeachers,
  findActiveTeachers,
  findTeacherFilterOptions,
  type TeacherDatabaseRow,
} from "@/server/repositories/teacher.repository";
import { decryptLaravel } from "@/server/security/laravel-crypto";

export type TeacherFilters = {
  province?: string | null;
  district?: string | null;
  zonal?: string | null;
  divisional?: string | null;
  school?: string | null;
  subject?: string | null;
  gender?: string | null;
  teacherCategory?: string | null;
  medium?: string | null;
};

export type TeacherFilterOptions = {
  provinces: string[];
  districts: string[];
  zonals: string[];
  divisionals: string[];
  schools: string[];
  subjects: string[];
  genders: string[];
  teacherCategories: string[];
  mediums: string[];
};

export type ListTeachersInput = {
  page?: number;
  limit?: number;
  filters?: TeacherFilters | null;
};

function mapTeacher(row: TeacherDatabaseRow): Teacher {
  return {
    employeeId: row.employeeId,
    name: decryptLaravel(row.encryptedName),
    nic: decryptLaravel(row.encryptedNic),
    currentSchoolId: row.currentSchoolId,
    currentSchool: row.currentSchool,
    currentZonalId: row.currentZonalId,
    currentZonal: row.currentZonal,
    subjectId: row.subjectId,
    subject: row.subject,
    genderId: row.genderId,
    gender: row.gender,
    teacherCategoryId: row.teacherCategoryId,
    teacherCategory: row.teacherCategory,
    mediumId: row.mediumId,
    medium: row.medium,
    firstServiceDate: row.firstServiceDate,
    serviceYears: row.serviceYears === null ? null : Number(row.serviceYears),
  };
}

export async function listTeacherFilterOptions(
  filters: TeacherFilters = {},
): Promise<TeacherFilterOptions> {
  return findTeacherFilterOptions(filters);
}

export async function listTeachers(
  input: ListTeachersInput = {},
): Promise<TeacherListResult> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 25;
  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("page must be at least 1", 400, "page");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("limit must be between 1 and 100", 400, "limit");
  }

  const filters = input.filters ?? {};
  const [total, rows] = await Promise.all([
    countActiveTeachers(filters),
    findActiveTeachers(limit, (page - 1) * limit, filters),
  ]);
  return {
    rows: rows.map(mapTeacher),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
