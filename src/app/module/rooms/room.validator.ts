import z from "zod";
import {
  RoomStatus,
  RoomType,
} from "../../../../prisma/generated/prisma/enums";

const roomtypes = Object.getOwnPropertyNames(RoomType);
const roomStatus = Object.getOwnPropertyNames(RoomStatus);

const RoomZodSchema = z.object({
  roomNumber: z
    .string("Provide String")
    .min(3, "Provide Minimum 3 Character")
    .max(6, "Max ^ characters"),
  roomType: z.enum([...roomtypes]).optional(),
  monthlyRent: z
    .number("Provide Number!")
    .positive("Plz Provide a valid number")
    .gte(2000, "Minimum rent should be a 2000 tk"),
  capacity: z
    .number("Provide number")
    .positive("Plz provide valid number")
    .gt(0, "Plz provide a number greater than zero "),
  roomstatus: z.enum([...roomStatus]).optional(),
});

export const roomDataValidator = {
  RoomZodSchema,
};
