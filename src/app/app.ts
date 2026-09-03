import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import httpstatus from "http-status";

import AppError from "./utils/appError.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { configs } from "./config/index.js";

const app: Application = express();

//middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: configs.frontend_url,
    credentials: true,
  }),
);

app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.end("root page");
});

// 404 Not found

app.use((req, res, next) => {
  next(new AppError("Route Not Found", httpstatus.NOT_FOUND));
});

app.use(globalErrorHandler);

export default app;
