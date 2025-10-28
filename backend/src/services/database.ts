import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

// Connect to database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

// Disconnect from database
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
    throw error;
  }
};

// Ensure database connection is gracefully handled
process.on("beforeExit", async () => {
  await disconnectDatabase();
});

export default prisma;
