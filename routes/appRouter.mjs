import express from "express";
import {
  homeGet,
  postsGet,
  postsNewGet,
  postsNewPost,
  postsDelete,
} from "../controllers/postController.mjs";

const appRouter = express.Router();

appRouter.get("/", homeGet);
appRouter.get("/posts", postsGet);
appRouter.get("/posts/new", postsNewGet);
appRouter.post("/posts/new", postsNewPost);
appRouter.delete("/posts/delete", postsDelete);

export default appRouter;
