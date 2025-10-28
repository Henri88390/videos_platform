import app from "./app.js";
import { disconnectDatabase } from "./services/database.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - Video: http://localhost:${PORT}/api/video`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
});
