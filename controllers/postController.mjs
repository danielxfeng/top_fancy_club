import asyncHandler from "express-async-handler";

const homeGet = asyncHandler((req, res) => {
    res.render("index", { title: "Home" });
});
const postsGet = (req, res) => {};
const postsNewGet = (req, res) => {};
const postsNewPost = (req, res) => {};
const postsDelete = (req, res) => {};

export { homeGet, postsGet, postsNewGet, postsNewPost, postsDelete };
