/**
 * The router for the authentication routes.
 */
import express from "express";
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

// Configure the authentication middleware

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await readUserByEmail(email);

      if (!user) return done(null, false, { message: "Incorrect Email" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
    },
    async (issuer, profile, done) => {
      try {
        let user = await readUserFromOAuth("google", profile.id);

        if (!user)
          user = await createUserFromOAuth(
            profile.displayName,
            "google",
            profile.id
          );

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await readUserById(id);
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err);
  }
});

// The router.

const authRouter = express.Router();

authRouter.get("/user/login/federated/google", passport.authenticate("google"));
