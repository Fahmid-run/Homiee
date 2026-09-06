import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { properyController } from "./property.controller";

const router = Router();

router.post(
  "/",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  properyController.createProperty,
);
router.get("/", properyController.getAllProperty);
router.get("/:id", properyController.getPropertiesById);
router.get(
  "/me",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  properyController.getPropertiesByOwnerId,
);
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  properyController.deleteProperty,
);

// router.post("/login", properyController.loginUser);
// router.get(
//   "/me",
//   auth(Role.ADMIN, Role.TENANT, Role.PROPERTY_OWNER),
//   AuthController.getMe,
// );
// router.post("/refresh-token", AuthController.refreshToken);

export const ProperyRoutes = router;
