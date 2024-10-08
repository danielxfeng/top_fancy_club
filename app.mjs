import express from "express";
import session from "express-session";
import { csrfSync } from "csrf-sync";
import dotenv from "dotenv";
import pgSimple from "connect-pg-simple";
import passport from "passport";
import flash from "connect-flash";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/pool.mjs";
import appRouter from "./routes/appRouter.mjs";
import authRouter from "./routes/authRouter.mjs";

dotenv.config();

const app = express();

// EJS configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session configuration
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

// CSRF protection configuration
const { csrfSynchronisedProtection } = csrfSync();
app.use(csrfSynchronisedProtection);
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Passport configuration
app.use(passport.session());

// Flash messages configuration
app.use(flash());
app.use((req, res, next) => {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

// Routes
app.use("/", appRouter);
app.use("/", authRouter);

// 404 Error handler
app.use((req, res, next) => {
  next(createError(404));
});

// General error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
