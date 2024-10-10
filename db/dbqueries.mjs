import pool from "./pool.mjs";
import bcrypt from "bcryptjs";

// This module contains all the database queries.

// Helper function to execute SQL queries
const query = async (SQL, params = null) => {
  if (params) {
    return pool.query(SQL, params);
  }
  return pool.query(SQL);
};

// Create a new user. Empty email and/or password is allowed because of the OAuth login.
// Password is hashed before storing it in the database.
// Return the created user.
const createUser = async (name, email = null, password = null) => {
  if (password) {
    password = await bcrypt.hash(password, 10);
  }
  const SQL =
    "INSERT INTO club_users (name, email, password) VALUES ($1, $2, $3) RETURNING *";
  const result = await query(SQL, [name, email, password]);
  return result.rows[0]; // We created only one user once.
};

const readUserFromOAuth = async (provider, subject) => {
  const SQL = `
  SELECT * FROM club_users
    WHERE id IN 
    (SELECT user_id FROM club_federated_credentials
      WHERE provider = $1 AND subject = $2)`;
  const result = await query(SQL, [provider, subject]);
  return result.rows[0]; // The user is unique.
};

const createUserFromOAuth = async (name, provider, subject) => {
  const SQL = `
  WITH new_user AS (
    INSERT INTO club_users (name)
    VALUES ($1)
    RETURNING *
  )
  , inserted_credential AS (
    INSERT INTO club_federated_credentials (user_id, provider, subject)
    VALUES ((SELECT id FROM new_user), $2, $3)
  )
  SELECT * FROM new_user;`;
  const result = await query(SQL, [name, provider, subject]);
  return result.rows[0]; // We created only one user once.
};

// Get a user by email
const readUserByEmail = async (email) => {
  const SQL = "SELECT * FROM club_users WHERE email = $1";
  const result = await query(SQL, [email]);
  return result.rows[0]; // Email has a unique constraint.
};

// Get a user by id
const readUserById = async (id) => {
  const SQL = "SELECT * FROM club_users WHERE id = $1";
  const result = await query(SQL, [id]);
  return result.rows[0]; // ID is the primary key.
};

// Update the membership status of a user
const updateClubMembership = async (id, isClubMember, code) => {
  const SQL = `
  UPDATE club_users
  SET is_club_member = $2
  WHERE id = $1
    AND $3 = ANY(
      SELECT code
      FROM club_codes
      WHERE name = 'member'
    )
  RETURNING *`;
  const result = await query(SQL, [id, isClubMember, code]);
  return result.rows[0];
};

// Update the admin status of a user.
// When a user becomes an admin, he/she also become a club member.
const updateAdminStatus = async (id, isAdmin, code) => {
  const SQL = `
  UPDATE club_users
  SET is_admin = $2, is_club_member = $2
  WHERE id = $1
    AND $3 = ANY(
      SELECT code
      FROM club_codes
      WHERE name = 'admin'
    )
  RETURNING *`;
  const result = await query(SQL, [id, isAdmin, code]);
  return result.rows[0];
};

// Create a new post
const createPost = async (title, content, userId) => {
  const SQL =
    "INSERT INTO club_posts (title, content, user_id) VALUES ($1, $2, $3)";
  return query(SQL, [title, content, userId]).rows[0]; // We created only one post once.
};

// Read all posts
const readAllPosts = async () => {
  const SQL = "SELECT * FROM club_posts";
  const result = await query(SQL);
  return result.rows;
};

// Read a post by id
const deletePost = async (id) => {
  const SQL = "DELETE FROM club_posts WHERE id = $1";
  return query(SQL, [id]);
};

export {
  createUser,
  readUserByEmail,
  readUserById,
  readUserFromOAuth,
  createUserFromOAuth,
  updateClubMembership,
  updateAdminStatus,
  createPost,
  readAllPosts,
  deletePost,
};
