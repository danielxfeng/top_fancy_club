import pool from "./pool.mjs";
import bcrypt from "bcryptjs";

// This module contains all the database queries.

// Helper function to execute SQL queries
const query = async (SQL, params = null) => {
  if (params) {
    return await pool.query(SQL, params);
  }
  return await pool.query(SQL);
};

// Create a new user. Empty password is allowed because of the OAuth login.
const createUser = async (name, email, password = null) => {
  if (password) {
    password = await bcrypt.hash(password, 10);
  }
  const SQL =
    "INSERT INTO club_users (name, email, password) VALUES ($1, $2, $3)";
  return await query(SQL, [name, email, password]);
};

// Get a user by email
const readUserByEmail = async (email) => {
  const SQL = "SELECT * FROM club_users WHERE email = $1";
  const result = await query(SQL, [email]);
  return await result.rows[0]; // Email has a unique constraint.
};

// Get a user by id
const readUserById = async (id) => {
  const SQL = "SELECT * FROM club_users WHERE id = $1";
  const result = await query(SQL, [id]);
  return await result.rows[0]; // ID is the primary key.
};

// Update the membership status of a user
const updateClubMembership = async (id, isClubMember) => {
  const SQL = "UPDATE club_users SET is_club_member = $2 WHERE id = $1";
  return await query(SQL, [id, isClubMember]);
};

// Update the admin status of a user
const updateAdminStatus = async (id, isAdmin) => {
  const SQL = "UPDATE club_users SET is_admin = $2 WHERE id = $1";
  return await query(SQL, [id, isAdmin]);
};

// Create a new post
const createPost = async (title, content, userId) => {
  const SQL =
    "INSERT INTO club_posts (title, content, user_id) VALUES ($1, $2, $3)";
  return await query(SQL, [title, content, userId]);
};

// Read all posts
const readAllPosts = async () => {
  const SQL = "SELECT * FROM club_posts";
  const result = await query(SQL);
  return await result.rows;
};

// Read a post by id
const deletePost = async (id) => {
  const SQL = "DELETE FROM club_posts WHERE id = $1";
  return await query(SQL, [id]);
};

export {
  createUser,
  readUserByEmail,
  readUserById,
  updateClubMembership,
  updateAdminStatus,
  createPost,
  readAllPosts,
  deletePost,
};
