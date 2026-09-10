import { createClient } from "redis";
import { configs } from "../config";

// export const redisClient = createClient({
//   username: configs.redis_usrname,
//   password: configs.redis_pwd,
//   socket: {
//     host: configs.redis_host,
//     port: Number(configs.redis_port),
//   },
// });
export const redisClient = createClient({
  url: "redis://localhost:6379",
});
