import {
  RoomStatus,
  RoomType,
} from "../../../../prisma/generated/prisma/enums";

export interface RoomPayload {
  roomNumber: string;
  roomType: RoomType;
  monthlyRent: Number;
  capacity: Number;
  roomstatus: RoomStatus;
}
