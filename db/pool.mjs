import pkg from "pg";
const { Pool } = pkg;

// Create the pool of DB connections
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export default pool;
