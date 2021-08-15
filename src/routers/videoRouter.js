import express from "express";
import {
  watch,
  getedit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectedMiddleware } from "../middleware";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectedMiddleware)
  .get(getedit)
  .post(postEdit);
// videoRouter.get("/:id(\\d+)/edit", getedit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectedMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .get(getUpload)
  .all(protectedMiddleware)
  .post(postUpload);
export default videoRouter;
