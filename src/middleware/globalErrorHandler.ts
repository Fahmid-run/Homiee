import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { configs } from "../config";
import { Prisma } from "../../prisma/generated/prisma/client";

export const globalErrorHandler = async (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (configs.node_env === "development") {
    console.error("Error from Global Error Handler:", err);
  }

  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorName = err?.name || "Error";

  if (
    typeof err?.statusCode === "number" &&
    err.statusCode >= 100 &&
    err.statusCode < 600
  ) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (
    typeof err?.status === "number" &&
    err.status >= 100 &&
    err.status < 600
  ) {
    statusCode = err.status;
    errorMessage = err.message;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST || 400;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST || 400;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST || 400;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND || 404;
      errorMessage = "Record not found";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR || 500;
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED || 401;
      errorMessage = "Authentication failed against database server";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST || 400;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR || 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }

  const finalStatusCode = Number.isInteger(statusCode) ? statusCode : 500;

  return res.status(finalStatusCode).json({
    success: false,
    statusCode: finalStatusCode,
    name: errorName,
    message: errorMessage,
    error: configs.node_env === "development" ? err : undefined,
    stack: configs.node_env === "development" ? err.stack : undefined,
  });
};
