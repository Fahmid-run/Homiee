import { Router } from "express";

import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../../prisma/generated/prisma/enums";
import { roomController } from "./rooms.controller";
import { validationReq } from "../../middleware/validationRequest";
import { roomDataValidator } from "./room.validator";

const router = Router();

router.post(
  "/:propertyId",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  validationReq(roomDataValidator.RoomZodSchema),
  roomController.createRoom,
);

router.get("/", roomController.getAllRooms);

router.get("/:roomId", roomController.getRoomsById);
router.get(
  "/owner/me",
  auth(Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  roomController.getRoomsByOwnerId,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.PROPERTY_OWNER, Role.PROPERTY_MANAGER),
  roomController.deleteRoom,
);

export const RoomRoutes = router;
