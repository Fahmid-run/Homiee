import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const configs = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bak_url: process.env.APP_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  bkash_username: process.env.BKASH_TOKENIZE_USER_NAME,
  bkash_password: process.env.BKASH_TOKENIZE_PASSWORD,
  bkash_baseUrl: process.env.BKASH_TOKENIZE_BASE_URL,
  bkash_app_secret: process.env.BKASH_APP_SECRET,
  bkash_app_key: process.env.BKASH_APP_KEY,

  redis_usrname: process.env.REDIS_USERNAME!,
  redis_pwd: process.env.REDIS_PASSWORD!,
  redis_host: process.env.REDIS_HOST!,
  redis_port: process.env.REDIS_PORT!,

  bkash_callback_Url: process.env.BKASH_CALLBACK_URL,
};
