import { configs } from "../config";
import AppError from "../utils/appError";
import httpstatus from "http-status";
import { redisClient } from "./redis";

export const getGrandToken = async () => {
  const idTokenKey = "bkash:idToken";
  const refreshTokenKey = "bkash:refreshTokenKey";

  let bkashIdToken: string | null = null;
  let bkashRefreshToken: string | null = null;
  let bkashIdTokenTTl = 0;
  let bkashRefreshTokenTTl = 0;

  try {
    bkashIdToken = (await redisClient.get(idTokenKey)) as string | null;
    bkashRefreshToken = (await redisClient.get(refreshTokenKey)) as
      | string
      | null;

    if (bkashIdToken) {
      bkashIdTokenTTl = await redisClient.ttl(idTokenKey);
    }
    if (bkashRefreshToken) {
      bkashRefreshTokenTTl = await redisClient.ttl(refreshTokenKey);
    }
  } catch (redisErr) {
    console.error(
      "Redis read failed on Netlify, falling back to direct bKash API call:",
      redisErr,
    );
  }

  if (bkashIdToken && bkashIdTokenTTl > 600) {
    return bkashIdToken;
  }

  if (
    (bkashIdTokenTTl <= 600 || !bkashIdToken) &&
    bkashRefreshToken &&
    bkashRefreshTokenTTl > 600
  ) {
    try {
      const refreshTokenRes = await fetch(
        `${configs.bkash_baseUrl}/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: configs.bkash_username ?? "",
            password: configs.bkash_password ?? "",
          },
          body: JSON.stringify({
            app_key: configs.bkash_app_key,
            app_secret: configs.bkash_app_secret,
            refresh_token: bkashRefreshToken,
          }),
        },
      );

      if (refreshTokenRes.ok) {
        const bkashRefreshTokenResult = await refreshTokenRes.json();
        bkashIdToken = bkashRefreshTokenResult.id_token as string;

        try {
          await redisClient.set(idTokenKey, bkashIdToken, {
            expiration: { type: "EX", value: 60 * 60 },
          });
        } catch (e) {
          console.error("Redis set error:", e);
        }
        return bkashIdToken;
      }
    } catch (e) {
      console.warn("bKash token refresh failed, falling back to grant token");
    }
  }

  // 4. Grant Token (Direct bKash API Call)
  const res = await fetch(`${configs.bkash_baseUrl}/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: configs.bkash_username ?? "",
      password: configs.bkash_password ?? "",
    },
    body: JSON.stringify({
      app_key: configs.bkash_app_key,
      app_secret: configs.bkash_app_secret,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("bKash grant token error response:", errorData);
    throw new AppError(
      errorData.statusMessage || "Bkash accessToken fetch failed!!",
      httpstatus.NOT_FOUND,
    );
  }

  const result = await res.json();

  // 5. Safely set keys in Redis without blocking the response
  try {
    await redisClient.set(idTokenKey, result.id_token, {
      expiration: { type: "EX", value: 60 * 60 },
    });
    await redisClient.set(refreshTokenKey, result.refresh_token, {
      expiration: { type: "EX", value: 60 * 60 * 24 * 28 },
    });
  } catch (redisSetErr) {
    console.error("Redis set failed on Netlify:", redisSetErr);
  }

  return result.id_token as string;
};
