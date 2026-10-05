/**
 * @deprecated REST and GraphQL use controllers, services, and repositories.
 * Keep this file only as a temporary compatibility reference during migration.
 */
import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/server/db";
import { decryptLaravel } from "@/server/laravel-crypto";

export type TeacherEmployeeRow = {
  employeeId: string;
  name: string | null;
  nic: string | null;
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
};

type TeacherRowPacket = RowDataPacket & {
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
};

export async function getTeachers(page: number, limit: number) {
  const offset = (page - 1) * limit;
  const db = getDb();
  const [countRows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM teachers t
     INNER JOIN people p ON p.people_id = t.employee_id
     WHERE p.active_status = 1`,
  );
  const [rows] = await db.execute<TeacherRowPacket[]>(
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
       m.name AS medium
     FROM teachers t
     INNER JOIN people p ON p.people_id = t.employee_id
     LEFT JOIN employer_current_appointments a ON a.employee_id = t.employee_id
     LEFT JOIN institutions i ON i.workplace_id = a.workplace_id
     LEFT JOIN zonal_education_offices z ON z.workplace_id = i.zeo_wp_id
     LEFT JOIN subject_lists s ON s.subject_id = t.current_teaching_subject
     LEFT JOIN gender_lists g ON g.gender_id = p.gender_id
     LEFT JOIN teacher_categories tc ON tc.categories_id = t.teacher_category
     LEFT JOIN medium_of_instructions m ON m.medium_id = t.appointment_medium
     WHERE p.active_status = 1
     ORDER BY t.employee_id
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  return {
    total: Number(countRows[0]?.total ?? 0),
    rows: rows.map(
      (row): TeacherEmployeeRow => ({
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
      }),
    ),
  };
}
