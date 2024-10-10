/**
 * The router for the authentication routes.
 */
import express from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oidc";
import bcrypt from "bcryptjs";
import {
  readUserByEmail,
  readUserById,
  readUserFromOAuth,
  createUserFromOAuth,
} from "../db/dbqueries.mjs";
import {
  authGetLogin,
  authGetSignup,
  authPostSignup,
  authGetLogout,
  authGetJoinMembership,
  authPostJoinMembership,
  authGetJoinAdmin,
  authPostJoinAdmin,
} from "../controllers/authController.mjs";

// Configure the authentication middleware

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    asyncHandler(async (email, password, done) => {
      const user = await readUserByEmail(email);

      if (!user) return done(null, false, { message: "Incorrect Email" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    })
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
    },
    asyncHandler(async (issuer, profile, done) => {
      let user = await readUserFromOAuth("google", profile.id);

      if (!user)
        user = await createUserFromOAuth(
          profile.displayName,
          "google",
          profile.id
        );

      return done(null, user);
    })
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(
  asyncHandler(async (id, done) => {
    const user = await readUserById(id);
    done(null, user);
  })
);

// The router.

const authRouter = express.Router();

// href to google login page.
authRouter.get("/user/login/federated/google", passport.authenticate("google"));

// Callback of google login page.
authRouter.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/user/login",
  })
);

authRouter.get("/user/login", authGetLogin);
authRouter.post(
  "/user/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
  })
);
authRouter.get("/user/signup", authGetSignup);
authRouter.post("/user/signup", authPostSignup);
authRouter.get("/user/logout", authGetLogout);
authRouter.get("/user/join_membership/", authGetJoinMembership);
authRouter.post("/user/join_membership", authPostJoinMembership);
authRouter.get("/user/join_admin/", authGetJoinAdmin);
authRouter.post("/user/join_admin", authPostJoinAdmin);

export default authRouter;
