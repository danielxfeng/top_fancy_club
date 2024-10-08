import express from "express";
import session from "express-session";
import csrf from "csrf";
import dotenv from "dotenv";
import pgSimple from "connect-pg-simple";
import pool from "./db/pool.mjs";

dotenv.config();

const app = express();

const pgSession = pgSimple(session);
app.use(
  expressSession({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.FOO_COOKIE_SECRET,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
