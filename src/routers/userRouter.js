import express from "express";
import {
  postEdit,
  getEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  avatarupload,
  protectedMiddleware,
  publicOnlyMiddleware,
  uploadFiles,
} from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", protectedMiddleware, logout);
userRouter.get("/:id", see);
userRouter
  .route("/change-password")
  .all(protectedMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter
  .route("/edit")
  .all(protectedMiddleware)
  .get(getEdit)
  .post(avatarupload.single("avatar"), postEdit);
//multer가 input으로 avatar파일을 받아서 uplodas파일에 저장하고 그 파일 정보를 postEdit에 전달해준다.
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

export default userRouter;
