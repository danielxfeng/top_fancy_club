import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import {
  createUser,
  updateClubMembership,
  updateAdminStatus,
} from "../db/dbqueries.mjs";

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// GET /login
const authGetLogin = asyncHandler((req, res) => {
  if (req.user) return res.redirect("/");
  res.render("login", { title: "Login" });
});

// GET /signup
const authGetSignup = asyncHandler((req, res) => {
  res.render("signup", { title: "Sign Up" });
});

const signupValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value === req.body.password) return true;
    throw new Error("Passwords do not match");
  }),
];

// POST /signup
const authPostSignup = [
  signupValidation,
  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      error.array().forEach((err) => req.flash("error", err.msg));
      return res.redirect("/user/signup");
    }
    const { name, email, password } = req.body;
    try {
      const user = await createUser(name, email, password);
      req.login(user, (err) => {
        if (err) return next(err);
        res.redirect("/");
      });
    } catch (error) {
      if (error.code === "23505") {
        // unique_violation
        req.flash("error", "Account already exists");
        res.redirect("/user/signup");
      } else next(error);
    }
  }),
];

// GET /logout
const authGetLogout = asyncHandler((req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

const joinValidation = [
  body("code")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("Code is required, 32 characters max"),
];

// GET /join/membership
const authGetJoinMembership = asyncHandler((req, res) => {
  res.render("join", { title: "Join Membership", link: "membership" });
});

// Helper function for authPostJoinMembership and authPostJoinAdmin.
const authJoinHelper = async (req, res, next, type) => {
  if (!req.user) return res.redirect("/login");
  const error = validationResult(req);
  if (!error.isEmpty()) {
    error.array().forEach((err) => req.flash("error", err.msg));
    return res.redirect(`/user/join_${type}`);
  }
  const func = type === "membership" ? updateClubMembership : updateAdminStatus;
  const { code } = req.body;
  const user = await func(req.user.id, true, code);
  if (!user) {
    req.flash("error", "Invalid Code");
    return res.redirect(`/user/join_${type}`);
  }
  req.login(user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

// POST /join/membership
const authPostJoinMembership = [
  joinValidation,
  asyncHandler(async (req, res, next) => {
    await authJoinHelper(req, res, next, "membership");
  }),
];

// GET /join/admin
const authGetJoinAdmin = asyncHandler((req, res) => {
  res.render("join", { title: "Join Admin Team", link: "admin" });
});

// POST /join/admin
const authPostJoinAdmin = [
  joinValidation,
  asyncHandler(async (req, res, next) => {
    await authJoinHelper(req, res, next, "admin");
  }),
];

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
