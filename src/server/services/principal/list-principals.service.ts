import "server-only";
import { AppError } from "@/server/errors/app-error";
import type { Principal } from "@/server/models/principal.model";
import {
  countActivePrincipals,
  findActivePrincipals,
  type PrincipalDatabaseRow,
} from "@/server/repositories/principal.repository";
import { decryptLaravel } from "@/server/security/laravel-crypto";

export type ListPrincipalsInput = { page?: number; limit?: number };

export type PrincipalListResult = {
  rows: Principal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function mapPrincipal(row: PrincipalDatabaseRow): Principal {
  return {
    employeeId: row.employeeId,
    name: decryptLaravel(row.encryptedName),
    nic: decryptLaravel(row.encryptedNic),
    genderId: row.genderId,
    gender: row.gender,
    currentSchoolId: row.currentSchoolId,
    currentSchool: row.currentSchool,
    currentZonalId: row.currentZonalId,
    currentZonal: row.currentZonal,
    serviceId: row.serviceId,
    service: row.service,
    rankId: row.rankId,
    rank: row.rank,
  };
}

export async function listPrincipals(
  input: ListPrincipalsInput = {},
): Promise<PrincipalListResult> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 25;
  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("page must be at least 1", 400, "page");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("limit must be between 1 and 100", 400, "limit");
  }
  const [total, rows] = await Promise.all([
    countActivePrincipals(),
    findActivePrincipals(limit, (page - 1) * limit),
  ]);
  return {
    rows: rows.map(mapPrincipal),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
