import pool from "./pool.mjs";

const SQL = `
  CREATE TABLE IF NOT EXISTS club_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    is_club_member BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE IF NOT EXISTS club_federated_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES club_users(id),
    provider VARCHAR(100),
    subject VARCHAR(255),
    UNIQUE (provider, subject)
  );

  CREATE TABLE IF NOT EXISTS club_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES club_users(id),
    created_at TIMESTAMP DEFAULT (TIMEZONE('UTC', NOW()))
  );

  CREATE TABLE IF NOT EXISTS club_codes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL
  );

  CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
  )
  WITH (OIDS=FALSE);
  ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
  CREATE INDEX "IDX_session_expire" ON "session" ("expire");

  INSERT INTO club_codes (name, code)
  VALUES
  ('admin', 'admin'),
  ('member', 'member')
  ON CONFLICT (name) DO NOTHING;
`;

console.log("Populating the database with tables and codes");
try {
  await pool.query(SQL);
  console.log("Database populated successfully");
} catch (error) {
  console.error("Error populating the database:", error);
}
