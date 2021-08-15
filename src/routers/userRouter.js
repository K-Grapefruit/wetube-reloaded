import express from "express";
import {
  postEdit,
  getEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userController";
import { protectedMiddleware, publicOnlyMiddleware } from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", protectedMiddleware, logout);
userRouter.get(":id", see);
userRouter.route("/edit").all(protectedMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", protectedMiddleware, finishGithubLogin);

export default userRouter;
