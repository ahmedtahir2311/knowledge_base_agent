import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(process.env.POSTGRES_URL!, {
  prepare: false, // Disable prepared statements for compatibility with connection poolers
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn);
