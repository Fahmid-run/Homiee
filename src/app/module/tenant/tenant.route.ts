import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { tenantController } from "./tenant.controller";

const router = Router();

router.post("/:roomId", auth(Role.TENANT), tenantController.createViewReq);

// router.get("/", roomController.getAllRooms);

export const TenantRoutes = router;
