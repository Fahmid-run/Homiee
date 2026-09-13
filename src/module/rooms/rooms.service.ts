import { prisma } from "../../lib/prisma";
import { RoomPayload } from "./room.interface";

const createRoom = async (propertyId: string, payload: RoomPayload) => {
  const {
    roomNumber,
    roomType = "SHARED",
    monthlyRent,
    capacity,
    roomstatus = "AVAILABLE",
  } = payload;

  const res = await prisma.room.create({
    data: {
      roomNumber,
      roomType,
      monthlyRent: Number(monthlyRent),
      capacity: Number(capacity),
      roomstatus,
      propertyId,
    },
  });

  return res;
};

const getAllRooms = async () => {
  const res = await prisma.room.findMany({});

  return res;
};

const getRoomsById = async (id: string) => {
  const res = await prisma.room.findUnique({
    where: {
      id,
    },
  });

  return res;
};

const getRoomsByOwnerId = async (ownerId: string) => {
  const res = await prisma.room.findMany({
    where: {
      property: {
        ownerId,
      },
    },
  });

  return res;
};

const deleteRoom = async (id: string) => {
  const res = await prisma.room.delete({
    where: {
      id,
    },
  });

  return res;
};

export const roomServices = {
  createRoom,
  getAllRooms,
  getRoomsById,
  getRoomsByOwnerId,
  deleteRoom,
};
