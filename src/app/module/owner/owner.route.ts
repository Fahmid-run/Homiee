import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { ownerController } from "./owner.controller";

const router = Router();

router.patch(
  "/application/:applicationId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.updateApplicationStatus,
);

router.patch(
  "/view-req/:id",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.updateViewReqStatus,
);

router.post(
  "/documents/:tenancyId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.uploadDocuments,
);

export const OwnerRoutes = router;
