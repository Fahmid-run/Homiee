import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { properyController } from "./property.controller";
import { PropertyZodValidation } from "./property.validator";
import { validationReq } from "../../middleware/validationRequest";

const router = Router();

router.post(
  "/",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  validationReq(PropertyZodValidation.PropertyZodSchema),
  properyController.createProperty,
);
router.get("/", properyController.getAllProperty);
router.get("/:id", properyController.getPropertiesById);
router.get(
  "/owner/me",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  properyController.getPropertiesByOwnerId,
);
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  properyController.deleteProperty,
);

export const ProperyRoutes = router;
