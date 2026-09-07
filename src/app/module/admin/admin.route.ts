import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.patch("/user/block/:userid", auth(Role.ADMIN), AdminController.banUser);
router.get("/stats", auth(Role.ADMIN), AdminController.getStats);

export const AdminRoutes = router;
