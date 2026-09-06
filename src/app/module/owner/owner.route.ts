import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { ownerController } from "./owner.controller";

const router = Router();

router.patch(
  "/:applicationId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  ownerController.updateApplicationStatus,
);

// router.get("/", roomController.getAllRooms);

export const OwnerRoutes = router;
