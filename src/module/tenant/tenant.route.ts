import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../prisma/generated/prisma/enums";
import { tenantController } from "./tenant.controller";
import { validationReq } from "../../middleware/validationRequest";
import { tenantDataValidator } from "./tenant.validation";

const router = Router();

router.post(
  "/:roomId",
  auth(Role.TENANT),
  validationReq(tenantDataValidator.ViewReqZodSchema),
  tenantController.createViewReq,
);

router.get(
  "/view-request",
  auth(Role.TENANT),
  tenantController.getMyViewRequest,
);

router.post(
  "/application/:roomId",
  auth(Role.TENANT),
  validationReq(tenantDataValidator.ApplcationZodSchema),
  tenantController.createApplication,
);

router.post(
  "/roommate/preference/",
  auth(Role.TENANT),
  tenantController.createRoomMatePreference,
);

router.post(
  "/payment/rental/",
  auth(Role.TENANT),
  tenantController.createRentalCheckoutSession,
);

router.post("/payment/rental/webhook", tenantController.rentalBillWebhook);

router.get(
  "/payment/rental/callback",
  tenantController.handleRentalBkashCallback,
);

router.post(
  "/payment/bill/",
  auth(Role.TENANT),

  tenantController.createBillCheckoutSession,
);

router.post("/payment/bill-shares/webhook", tenantController.billwebhook);

router.get("/payment/bill/callback", tenantController.handleBillBkashCallback);

export const TenantRoutes = router;
