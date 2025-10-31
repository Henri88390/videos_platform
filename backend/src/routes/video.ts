import { Router } from "express";
import {
  deleteVideo,
  getVideoInfo,
  getVideos,
  streamVideo,
  uploadVideo,
} from "../controllers/videoController.js";
import { uploadSingle } from "../middleware/upload.js";
import { validateFile, validateParams } from "../middleware/validation.js";
import { VideoFileSchema, VideoIdSchema } from "../schemas/videoSchemas.js";

const videoRouter = Router();

// GET /api/video - Get list of available videos
videoRouter.get("/", getVideos);

// GET /api/video/:id/info - Get video information
videoRouter.get("/:id/info", validateParams(VideoIdSchema), getVideoInfo);

// GET /api/video/:id/stream - Stream video file
videoRouter.get("/:id/stream", validateParams(VideoIdSchema), streamVideo);

// POST /api/video/upload - Upload a single video file
videoRouter.post(
  "/upload",
  uploadSingle,
  validateFile(VideoFileSchema),
  uploadVideo
);

// DELETE /api/video/:id - Delete a video
videoRouter.delete("/:id", validateParams(VideoIdSchema), deleteVideo);

export default videoRouter;
