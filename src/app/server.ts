import app from "./app.js";
import { configs } from "./config/index.js";
import { prisma } from "./lib/prisma.js";
import { redisClient } from "./lib/redis.js";

const port = configs.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    await redisClient.connect();

    console.log("Connected to the redis  successfully.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
