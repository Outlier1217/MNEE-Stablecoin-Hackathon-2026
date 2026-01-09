import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "mnee_commerce",
  port: 5432,
});
