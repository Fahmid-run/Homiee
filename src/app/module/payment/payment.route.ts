import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/checkout-session/:tenancyID",
  auth(Role.TENANT),
  paymentController.createCheckoutSession,
);

router.post("/webhook", paymentController.webhook);

export const paymentRoute = router;
