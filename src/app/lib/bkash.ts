import { configs } from "../config";
import AppError from "../utils/appError";

import httpstatus from "http-status";
import { redisClient } from "./redis";

export const getGrandToken = async () => {
  try {
    const idTokenKey = "bkash:idToken";
    const refreshTokenKey = "bkash:refreshTokenKey";

    let bkashIdToken = await redisClient.get(idTokenKey);
    let bkashRefreshToken = await redisClient.get(refreshTokenKey);

    const bkashIdTokenTTl = await redisClient.ttl(idTokenKey);
    const bkashRefreshTokenTTl = await redisClient.ttl(refreshTokenKey);

    if (
      (bkashIdTokenTTl <= 600 || !bkashIdToken) &&
      bkashRefreshToken &&
      bkashRefreshTokenTTl > 600
    ) {
      const refreshTokenRes = await fetch(
        `${configs.bkash_baseUrl}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
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

      if (!refreshTokenRes.ok) {
        throw new Error("Bkash refreshToken fetch failed!!");
      }

      const bkashRefreshTokenResult = await refreshTokenRes.json();

      bkashIdToken = bkashRefreshTokenResult.id_token as string;

      await redisClient.set(idTokenKey, bkashIdToken, {
        expiration: {
          type: "EX",
          value: 60 * 60,
        },
      });
      return bkashIdToken;
    }
    if (bkashIdTokenTTl > 600) {
      return bkashIdToken;
    }
    const res = await fetch(
      `${configs.bkash_baseUrl}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          username: configs.bkash_username ?? "",
          password: configs.bkash_password ?? "",
        },
        body: JSON.stringify({
          app_key: configs.bkash_app_key,
          app_secret: configs.bkash_app_secret,
        }),
      },
    );

    if (!res.ok) {
      throw new AppError(
        "Bkash accessToken fetch failed!!",
        httpstatus.NOT_FOUND,
      );
    }

    const result = await res.json();

    await redisClient.set(idTokenKey, result.id_token, {
      expiration: { type: "EX", value: 60 * 60 },
    });
    await redisClient.set(refreshTokenKey, result.refresh_token, {
      expiration: { type: "EX", value: 60 * 60 * 24 * 28 },
    });

    bkashIdToken = result.id_token;
    return bkashIdToken;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
