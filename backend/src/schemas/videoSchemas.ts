import { z } from "zod";

// Video file validation schema
export const VideoFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string().min(1, "Filename is required"),
  encoding: z.string(),
  mimetype: z.enum(
    [
      "video/mp4",
      "video/avi",
      "video/x-msvideo",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/webm",
      "video/x-matroska",
    ],
    {
      message:
        "Only video files are allowed. Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV",
    }
  ),
  size: z
    .number()
    .max(500 * 1024 * 1024, "File too large. Maximum size is 500MB"),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
  buffer: z.any().optional(),
});

// Video ID parameter validation
export const VideoIdSchema = z.object({
  id: z.string("Invalid video ID format"),
});

// Video creation data validation
export const CreateVideoDataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  filename: z.string().min(1, "Filename is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimetype: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
  duration: z
    .number()
    .min(0, "Duration cannot be negative")
    .optional()
    .default(0),
});
