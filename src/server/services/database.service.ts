import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDb } from "@/server/db";

export async function checkDatabaseConnection(): Promise<boolean> {
  const [rows] = await getDb().execute<RowDataPacket[]>("SELECT 1 AS connected");
  return rows[0]?.connected === 1;
}
