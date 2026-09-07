import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
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

const createApplication = async (roomId: string, tenantId: string, payload) => {
  const { message } = payload;
  await checkExists(prisma.room, roomId, "Room Does not exists");

  const res = await prisma.application.create({
    data: {
      message,
      tenantId,
      roomId,
    },
  });

  return res;
};

export const tenantServices = {
  createViewReq,
  createApplication,
};
