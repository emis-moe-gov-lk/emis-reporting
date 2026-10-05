import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/server/database/db";
import type { TeacherFilters } from "@/server/services/teacher/list-teachers.service";

export type TeacherDatabaseRow = RowDataPacket & {
  employeeId: string;
  encryptedName: string;
  encryptedNic: string;
  currentSchoolId: string | null;
  currentSchool: string | null;
  currentZonalId: string | null;
  currentZonal: string | null;
  subjectId: string | null;
  subject: string | null;
  genderId: string | null;
  gender: string | null;
  teacherCategoryId: string | null;
  teacherCategory: string | null;
  mediumId: string | null;
  medium: string | null;
  firstServiceDate: string | null;
  serviceYears: number | null;
};

function activeTeacherWhere(filters: TeacherFilters) {
  const conditions = ["p.active_status = 1"];
  const values: string[] = [];
  const filterColumns: Array<[keyof TeacherFilters, string]> = [
    ["subject", "s.name_en"],
    ["gender", "g.gender_name"],
    ["teacherCategory", "tc.name"],
    ["medium", "m.name"],
  ];

  for (const [key, column] of filterColumns) {
    const value = filters[key]?.trim();
    if (value) {
      conditions.push(`${column} = ?`);
      values.push(value);
    }
  }

  return { clause: conditions.join(" AND "), values };
}

export async function countActiveTeachers(filters: TeacherFilters = {}): Promise<number> {
  const where = activeTeacherWhere(filters);
  const [rows] = await getDb().execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM teachers t
     INNER JOIN people p ON p.people_id = t.employee_id
     LEFT JOIN subject_lists s ON s.subject_id = t.current_teaching_subject
     LEFT JOIN gender_lists g ON g.gender_id = p.gender_id
     LEFT JOIN teacher_categories tc ON tc.categories_id = t.teacher_category
     LEFT JOIN medium_of_instructions m ON m.medium_id = t.appointment_medium
     WHERE ${where.clause}`,
    where.values,
  );
  return Number(rows[0]?.total ?? 0);
}

export async function findActiveTeachers(
  limit: number,
  offset: number,
  filters: TeacherFilters = {},
): Promise<TeacherDatabaseRow[]> {
  const where = activeTeacherWhere(filters);
  const [rows] = await getDb().execute<TeacherDatabaseRow[]>(
    `SELECT
       t.employee_id AS employeeId,
       p.full_name AS encryptedName,
       p.nic AS encryptedNic,
       i.workplace_id AS currentSchoolId,
       i.name AS currentSchool,
       z.workplace_id AS currentZonalId,
       z.name AS currentZonal,
       t.current_teaching_subject AS subjectId,
       s.name_en AS subject,
       p.gender_id AS genderId,
       g.gender_name AS gender,
       t.teacher_category AS teacherCategoryId,
       tc.name AS teacherCategory,
       t.appointment_medium AS mediumId,
       m.name AS medium,
       svc.firstServiceDate AS firstServiceDate,
       TIMESTAMPDIFF(YEAR, svc.firstServiceDate, CURDATE()) AS serviceYears
     FROM teachers t
     INNER JOIN people p ON p.people_id = t.employee_id
     LEFT JOIN (
       SELECT employee_id, MIN(first_appointment_date) AS firstServiceDate
       FROM employer_appointments
       WHERE first_appointment_date >= '1950-01-01'
         AND first_appointment_date <= CURDATE()
       GROUP BY employee_id
     ) svc ON svc.employee_id = t.employee_id
     LEFT JOIN employer_current_appointments a ON a.employee_id = t.employee_id
     LEFT JOIN institutions i ON i.workplace_id = a.workplace_id
     LEFT JOIN zonal_education_offices z ON z.workplace_id = i.zeo_wp_id
     LEFT JOIN subject_lists s ON s.subject_id = t.current_teaching_subject
     LEFT JOIN gender_lists g ON g.gender_id = p.gender_id
     LEFT JOIN teacher_categories tc ON tc.categories_id = t.teacher_category
     LEFT JOIN medium_of_instructions m ON m.medium_id = t.appointment_medium
     WHERE ${where.clause}
     ORDER BY t.employee_id
     LIMIT ? OFFSET ?`,
    [...where.values, limit, offset],
  );
  return rows;
}
