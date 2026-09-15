import app from "./app.js";
import { configs } from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import { redisClient } from "./lib/redis.js";

const port = configs.port;

// Safely connect Redis in Serverless context
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};

connectRedis();

// Only listen locally
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const main = async () => {
    try {
      await prisma.$connect();
      console.log("Connected to database successfully.");

      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (error) {
      console.error("Error starting server:", error);
      await prisma.$disconnect();
      process.exit(1);
    }
  };

  main();
}

export default app;
