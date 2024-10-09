import asyncHandler from "express-async-handler";
import { createUser } from "../db/dbqueries.mjs";

const authGetLogin = asyncHandler((req, res) => {
  res.render("login", { title: "Login" });
});

const authGetSignup = asyncHandler((req, res) => {
  res.render("signup", { title: "Sign Up" });
});

const authPostSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await createUser(name, email, password);
    req.session.userId = user.id;
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (error) {
    if (error.code === "23505") {
      // unique_violation
      const errorMessage = "Email already exists";
      res.render("signup", { title: "Sign Up", error: errorMessage });
    } else throw error;
  }
});

const authGetLogout = (req, res, next) => {};
const authGetJoinMembership = (req, res, next) => {};
const authPostJoinMembership = (req, res, next) => {};
const authGetJoinAdmin = (req, res, next) => {};
const authPostJoinAdmin = (req, res, next) => {};

export {
  authGetLogin,
  authGetSignup,
  authPostSignup,
  authGetLogout,
  authGetJoinMembership,
  authPostJoinMembership,
  authGetJoinAdmin,
  authPostJoinAdmin,
};
