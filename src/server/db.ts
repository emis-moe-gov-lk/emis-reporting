import "server-only";
import { createPool, type Pool } from "mysql2/promise";

const globalForMysql = globalThis as typeof globalThis & { mysqlPool?: Pool };

export function getDb(): Pool {
  if (globalForMysql.mysqlPool) return globalForMysql.mysqlPool;

  const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER || MYSQL_PASSWORD === undefined) {
    throw new Error("Missing MySQL configuration. Configure MYSQL_* in .env.local.");
  }
  const port = Number(MYSQL_PORT ?? "3306");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MYSQL_PORT must be a valid port number.");
  }

  globalForMysql.mysqlPool = createPool({
    host: MYSQL_HOST,
    port,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 20,
    connectTimeout: 5000,
    charset: "utf8mb4",
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: false,
  });
  return globalForMysql.mysqlPool;
}
