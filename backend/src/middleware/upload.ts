import { Request } from "express";
import multer from "multer";
import path from "path";

// Path to media folder
const UPLOAD_PATH = path.join(process.cwd(), "media", "videos");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName =
      file.originalname.replace(fileExtension, "") +
      "-" +
      uniqueSuffix +
      fileExtension;
    cb(null, fileName);
  },
});

// File filter for video files only
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "video/mp4",
    "video/avi",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/webm",
    "video/x-matroska",
  ];

  const allowedExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mkv",
  ];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

// Single file upload middleware
export const uploadSingle = upload.single("video");
