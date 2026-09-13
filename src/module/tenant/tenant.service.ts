import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
import httpstatus from "http-status";
import { CreateRoomMatePreferencePayload } from "./tenant.interface";
const createViewReq = async (
  roomId: string,
  tenantId: string,
  payload: { message: string; requestedDate: Date },
) => {
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

const createApplication = async (
  roomId: string,
  tenantId: string,
  payload: { message: string },
) => {
  const { message } = payload;
  await checkExists(prisma.room, roomId, "Room Does not exists");

  const isTenancyExists = await prisma.tenancy.findFirst({
    where: {
      tenantId,
      roomId,
    },
  });

  if (isTenancyExists) {
    throw new AppError("You Already Applied Earlier!!", httpstatus.NOT_FOUND);
  }

  const res = await prisma.application.create({
    data: {
      message,
      tenantId,
      roomId,
    },
  });

  return res;
};

const createRoomMatePreference = async (
  tenantId: string,
  payload: CreateRoomMatePreferencePayload,
) => {
  const { minAge, maxAge, smokingAllowed, sleepSchedule, preferredMoveInDate } =
    payload;

  await checkExists(prisma.tenantProfile, tenantId, "user does not exist");

  const res = await prisma.roomMatePreference.create({
    data: {
      minAge,
      maxAge,
      smokingAllowed,
      sleepSchedule,
      preferredMoveInDate,
      tenantId,
    },
  });

  return res;
};

export const tenantServices = {
  createViewReq,
  createRoomMatePreference,
  createApplication,
};
