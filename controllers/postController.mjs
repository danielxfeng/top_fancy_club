import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { readAllPosts, createPost, deletePost } from "../db/dbqueries.mjs";

// GET /
const homeGet = asyncHandler((req, res) => {
  res.render("index", { title: "Home" });
});

// GET /posts
const postsGet = asyncHandler(async (req, res) => {
  const posts = await readAllPosts();
  res.render("posts", { title: "Posts", posts });
});

// GET /posts/new
const postsNewGet = asyncHandler((req, res) => {
  res.render("createPost", { title: "New Post" });
});

const newPostValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1023 })
    .withMessage("Content is required"),
];

// POST /posts/new
const postsNewPost = [
  newPostValidation,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      req.flash("error", "You must be logged in to create a post");
      return res.redirect("/login");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((err) => req.flash("error", err.msg));
      return res.redirect("/posts/new");
    }
    const { title, content } = req.body;
    const userId = req.user.id;
    await createPost(title, content, userId);
    res.redirect("/posts");
  }),
];

// DELETE /posts/delete
const postsDelete = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.is_admin) {
    req.flash("error", "You must be an admin to delete a post");
    return res.redirect("/posts");
  }
  const { id } = req.body;
  await deletePost(id);
  res.redirect("/posts");
});

export { homeGet, postsGet, postsNewGet, postsNewPost, postsDelete };
