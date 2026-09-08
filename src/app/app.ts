import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import httpstatus from "http-status";

import AppError from "./utils/appError.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { configs } from "./config/index.js";
import { AuthRoutes } from "./module/auth/auth.route.js";
import { ProperyRoutes } from "./module/property/property.route.js";
import { RoomRoutes } from "./module/rooms/rooms.route.js";
import { TenantRoutes } from "./module/tenant/tenant.route.js";
import { OwnerRoutes } from "./module/owner/owner.route.js";
import { AdminRoutes } from "./module/admin/admin.route.js";
import { paymentController } from "./module/payment/payment.controller.js";
import { paymentRoute } from "./module/payment/payment.route.js";

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

// app.post(
//   "/api/payments/webhook",
//   express.raw({
//     type: "application/json",
//   }),
//   paymentController.webhook,
// );

app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.end("root page");
});

app.use("/api/v1/auth", AuthRoutes);

app.use("/api/v1/property", ProperyRoutes);

app.use("/api/v1/property/room", RoomRoutes);
app.use("/api/v1/tenant", TenantRoutes);
app.use("/api/v1/owner", OwnerRoutes);

app.use("/api/v1/admin", AdminRoutes);

app.use("/api/v1/payments", paymentRoute);

// 404 Not found

app.use((req, res, next) => {
  next(new AppError("Route Not Found", httpstatus.NOT_FOUND));
});

app.use(globalErrorHandler);

export default app;
