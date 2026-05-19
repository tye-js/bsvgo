import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
const readonlyConnectionString = process.env.DATABASE_READONLY_URL || connectionString;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const writeConnectionString = connectionString;
const readConnectionString = readonlyConnectionString || writeConnectionString;

const client = postgres(writeConnectionString, { prepare: false });
const readonlyClient =
  readConnectionString === writeConnectionString
    ? client
    : postgres(readConnectionString, { prepare: false });

export const db = drizzle(client, { schema });
export const readonlyDb = drizzle(readonlyClient, { schema });
export * from "./schema";
