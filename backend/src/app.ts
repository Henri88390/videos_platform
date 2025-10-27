import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import videoRouter from "./routes/video";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/video", videoRouter);

export default app;
