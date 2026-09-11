import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/bill/",
  auth(Role.TENANT),

  paymentController.createBillCheckoutSession,
);

router.post("/bill-shares/webhook", paymentController.billwebhook);

router.get("/bill/callback", paymentController.handleBillBkashCallback);

router.post(
  "/rental/",
  auth(Role.TENANT),

  paymentController.createRentalCheckoutSession,
);

router.post("/rental/webhook", paymentController.rentalBillWebhook);

router.get("/rental/callback", paymentController.handleRentalBkashCallback);

export const paymentRoute = router;
