import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { ownerController } from "./owner.controller";
import { validationReq } from "../../middleware/validationRequest";
import { ownerZodValidation } from "./owner.validation";

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
  validationReq(ownerZodValidation.UploadDocsZodSchema),
  ownerController.uploadDocuments,
);

router.post(
  "/bill/create/:roomId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.createBill,
);

router.post(
  "/rental/create/:roomId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.createRental,
);

router.get(
  "/bills/",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.getMyPropertyBills,
);

export const OwnerRoutes = router;
