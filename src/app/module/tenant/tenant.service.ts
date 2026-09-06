import { prisma } from "../../lib/prisma";
import { checkExists } from "../../utils/checkExist";

const createViewReq = async (roomId: string, tenantId: string, payload) => {
  const { message, requestedDate } = payload;

  const data = await checkExists(prisma.room, roomId, "Room Does not exists");

  const propertyId = data.propertyId;

  const res = await prisma.viewingRequest.create({
    data: {
      message,
      requestedDate,
      propertyId,
      tenantId,
      roomId,
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

export const tenantServices = {
  createViewReq,

  deleteRoom,
};
