import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/server/database/db";

export type PrincipalDatabaseRow = RowDataPacket & {
  employeeId: string;
  encryptedName: string;
  encryptedNic: string;
  genderId: string | null;
  gender: string | null;
  currentSchoolId: string | null;
  currentSchool: string | null;
  currentZonalId: string | null;
  currentZonal: string | null;
  serviceId: string | null;
  service: string | null;
  rankId: string | null;
  rank: string | null;
};

export async function countActivePrincipals(): Promise<number> {
  const [rows] = await getDb().execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM principals pr
     INNER JOIN people p ON p.people_id = pr.employee_id
     WHERE p.active_status = 1`,
  );
  return Number(rows[0]?.total ?? 0);
}

export async function findActivePrincipals(
  limit: number,
  offset: number,
): Promise<PrincipalDatabaseRow[]> {
  const [rows] = await getDb().execute<PrincipalDatabaseRow[]>(
    `SELECT
       pr.employee_id AS employeeId,
       p.full_name AS encryptedName,
       p.nic AS encryptedNic,
       p.gender_id AS genderId,
       g.gender_name AS gender,
       i.workplace_id AS currentSchoolId,
       i.name AS currentSchool,
       z.workplace_id AS currentZonalId,
       z.name AS currentZonal,
       sr.service_id AS serviceId,
       sv.service_name AS service,
       a.rank_id AS rankId,
       sr.rank_name AS rank
     FROM principals pr
     INNER JOIN people p ON p.people_id = pr.employee_id
     LEFT JOIN employer_current_appointments a ON a.employee_id = pr.employee_id
     LEFT JOIN institutions i ON i.workplace_id = a.workplace_id
     LEFT JOIN zonal_education_offices z ON z.workplace_id = i.zeo_wp_id
     LEFT JOIN gender_lists g ON g.gender_id = p.gender_id
     LEFT JOIN service_ranks sr ON sr.rank_id = a.rank_id
     LEFT JOIN services sv ON sv.service_id = sr.service_id
     WHERE p.active_status = 1
     ORDER BY pr.employee_id
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows;
}
