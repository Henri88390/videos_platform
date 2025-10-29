import { NextFunction, Request, Response } from "express";
import { createReadStream, existsSync, statSync } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { videoService } from "../services/videoService.js";
import { ApiResponse } from "../types/index.js";

// Path to media folder
const MEDIA_PATH = path.join(process.cwd(), "media", "videos");

export const getVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videos = await videoService.getAllVideos();

    // Transform database videos to API response format
    const videoData = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || `Video file: ${video.filename}`,
      filename: video.filename,
      duration: video.duration,
      size: video.size,
      createdAt: video.createdAt,
      modifiedAt: video.updatedAt,
    }));

    const response: ApiResponse = {
      success: true,
      data: videoData,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getVideoInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videoId = req.params.id;
    const video = await videoService.getVideoById(videoId);

    if (!video) {
      res.status(404).json({
        success: false,
        error: "Video not found",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: video.id,
        title: video.title,
        description: video.description || `Video file: ${video.filename}`,
        filename: video.filename,
        duration: video.duration,
        size: video.size,
        createdAt: video.createdAt,
        modifiedAt: video.updatedAt,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const streamVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videoId = req.params.id;
    const video = await videoService.getVideoById(videoId);

    if (!video) {
      res.status(404).json({
        success: false,
        error: "Video not found",
      });
      return;
    }

    // Get the actual video file path
    const videoPath = path.join(MEDIA_PATH, video.filename);

    if (!existsSync(videoPath)) {
      res.status(404).json({
        success: false,
        error: "Video file not found on server",
      });
      return;
    }

    const stat = statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Get content type based on file extension
    const getContentType = (filename: string): string => {
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        ".mp4": "video/mp4",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".wmv": "video/x-ms-wmv",
        ".flv": "video/x-flv",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
      };
      return contentTypes[ext] || "video/mp4";
    };

    const contentType = getContentType(video.filename);

    if (range) {
      // Parse range header for partial content requests
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).json({
          success: false,
          error: "Range not satisfiable",
        });
        return;
      }

      const chunkSize = end - start + 1;
      const fileStream = createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      fileStream.pipe(res);
    } else {
      // Stream entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });

      createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
};

export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No video file provided",
      });
      return;
    }

    const file = req.file;
    const stats = statSync(file.path);

    // Extract title from filename (without extension)
    const title = path.parse(file.originalname).name.normalize("NFC");

    // Check if video already exists
    const existingVideo = await videoService.getVideoByFilename(file.filename);
    if (existingVideo) {
      // Return existing video
      const response: ApiResponse = {
        success: true,
        data: {
          id: existingVideo.id,
          title: existingVideo.title,
          description: existingVideo.description,
          filename: existingVideo.filename,
          duration: existingVideo.duration,
          size: existingVideo.size,
          createdAt: existingVideo.createdAt,
          modifiedAt: existingVideo.updatedAt,
        },
        message: "Video already exists",
      };

      res.status(200).json(response);
      return;
    }

    // Create new video record in database
    const newVideo = await videoService.createVideo({
      title,
      description: `Uploaded video: ${file.originalname}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: stats.size,
      duration: 0, // Would need ffprobe to get actual duration
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: newVideo.id,
        title: newVideo.title,
        description: newVideo.description,
        filename: newVideo.filename,
        duration: newVideo.duration,
        size: newVideo.size,
        createdAt: newVideo.createdAt,
        modifiedAt: newVideo.updatedAt,
      },
      message: "Video uploaded successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videoId = req.params.id;
    const video = await videoService.getVideoById(videoId);

    if (!video) {
      res.status(404).json({
        success: false,
        error: "Video not found",
      });
      return;
    }

    // Delete video record from database
    await videoService.deleteVideo(videoId);

    const videoPath = path.join(MEDIA_PATH, video.filename);
    if (existsSync(videoPath)) {
      await unlink(videoPath);
    }

    const response: ApiResponse = {
      success: true,
      data: null,
      message: "Video deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
