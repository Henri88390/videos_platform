import { NextFunction, Request, Response } from "express";
import { createReadStream, existsSync, statSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { ApiResponse } from "../types";

// Path to media folder
const MEDIA_PATH = path.join(process.cwd(), "media", "videos");

// Function to get video files from media folder
const getVideoFiles = async () => {
  try {
    if (!existsSync(MEDIA_PATH)) {
      return [];
    }

    // Read directory with explicit UTF-8 encoding and normalize filenames
    const files = await readdir(MEDIA_PATH, { encoding: "utf8" });
    return files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [
          ".mp4",
          ".avi",
          ".mov",
          ".wmv",
          ".flv",
          ".webm",
          ".mkv",
        ].includes(ext);
      })
      .map((file, index) => {
        const filePath = path.join(MEDIA_PATH, file);
        const stats = statSync(filePath);

        // Handle Unicode normalization more aggressively
        // Convert from NFD (decomposed) to NFC (composed) and clean up
        let normalizedFile = file;
        let normalizedTitle = path.parse(file).name;

        try {
          // Multiple normalization attempts to handle different encoding issues
          normalizedFile = file.normalize("NFC");
          normalizedTitle = path.parse(normalizedFile).name.normalize("NFC");

          // Additional cleanup for common encoding issues
          normalizedTitle = normalizedTitle
            .replace(/aÌ\u0080/g, "à") // Fix specific "aÌ" issue
            .replace(/eÌ\u0081/g, "é") // Fix "eÌ" issue
            .replace(/iÌ\u0088/g, "ì") // Fix other similar issues
            .replace(/oÌ\u0080/g, "ò")
            .replace(/uÌ\u0080/g, "ù");
        } catch (error) {
          console.warn("Unicode normalization failed for file:", file, error);
        }

        return {
          id: (index + 1).toString(),
          title: normalizedTitle,
          description: `Video file: ${normalizedFile}`,
          filename: file, // Keep original filename for filesystem operations
          duration: 0, // Would need ffprobe to get actual duration
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      });
  } catch (error) {
    console.error("Error reading video files:", error);
    return [];
  }
};

export const getVideos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videos = await getVideoFiles();
    const response: ApiResponse = {
      success: true,
      data: videos,
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
    const videos = await getVideoFiles();
    const video = videos.find((v) => v.id === videoId);

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
      const chunksize = end - start + 1;

      // Create read stream for the specified range
      const file = createReadStream(videoPath, { start, end });

      // Set headers for partial content
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      });

      file.pipe(res);
    } else {
      // No range header, send entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      });

      const file = createReadStream(videoPath);
      file.pipe(res);
    }
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
    const videos = await getVideoFiles();
    const video = videos.find((v) => v.id === videoId);

    if (!video) {
      res.status(404).json({
        success: false,
        error: "Video not found",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: video,
    };

    res.json(response);
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

    // After upload, refresh the video list to get the correct ID
    const videos = await getVideoFiles();
    const uploadedVideo = videos.find((v) => v.filename === file.filename);

    if (!uploadedVideo) {
      res.status(500).json({
        success: false,
        error: "Uploaded video not found in system",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: uploadedVideo,
      message: "Video uploaded successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
