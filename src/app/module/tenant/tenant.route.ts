import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
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

export const TenantRoutes = router;
