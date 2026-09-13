import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import httpstatus from "http-status";

import AppError from "./utils/appError";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { configs } from "./config/index";
import { AuthRoutes } from "./module/auth/auth.route";
import { ProperyRoutes } from "./module/property/property.route";
import { RoomRoutes } from "./module/rooms/rooms.route";
import { TenantRoutes } from "./module/tenant/tenant.route";
import { OwnerRoutes } from "./module/owner/owner.route";
import { AdminRoutes } from "./module/admin/admin.route";
import { paymentController } from "./module/payment/payment.controller";
import { paymentRoute } from "./module/payment/payment.route";

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

app.post(
  "/api/v1/payments/webhook",
  express.raw({
    type: "application/json",
  }),
  paymentController.billwebhook,
);

app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.end("root route");
});

app.use("/api/v1/auth", AuthRoutes);

app.use("/api/v1/property", ProperyRoutes);

app.use("/api/v1/room", RoomRoutes);
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
