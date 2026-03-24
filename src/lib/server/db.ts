import { Pool } from "pg";

export const databasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
