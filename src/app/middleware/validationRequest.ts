import z from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import httpStatus from "http-status";

export const validationReq = (schema: z.ZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body ?? {};

      const result = schema.safeParse(payload);
      if (!result.success) {
        throw new AppError(
          result.error.issues[0].message,
          httpStatus.BAD_REQUEST,
        );
      }

      req.body = payload.data;

      next();
    } catch (error) {
      next(error);
    }
  });
};
