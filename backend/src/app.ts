import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import videoRouter from "./routes/video";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/video", videoRouter);

// Error handling middleware for multer and other errors
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 500MB.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum is 5 files.",
      });
    }

    if (error.message === "Only video files are allowed!") {
      return res.status(400).json({
        success: false,
        error:
          "Only video files are allowed. Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV",
      });
    }

    console.error("Unhandled error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
);

export default app;
