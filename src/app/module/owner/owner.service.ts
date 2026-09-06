import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
import httpStatus from "http-status";

const updateApplicationStatus = async (
  userid: string,
  ownerId: string,
  applicationId: string,
  payload,
) => {
  const { status } = payload;

  const applicationData = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      room: true,
    },
  });

  if (!applicationData) {
    throw new AppError("Application Does not exists", httpStatus.NOT_FOUND);
  }

  const propertyData = await prisma.property.findUnique({
    where: {
      id: applicationData.room.propertyId,
    },
  });

  if (ownerId !== propertyData?.ownerId) {
    throw new AppError("Forbidden", httpStatus.FORBIDDEN);
  }

  const res = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status,
      reviewedBy: userid,
    },
  });

  return res;
};

// const createApplication = async (roomId: string, tenantId: string, payload) => {
//   const { message } = payload;
//   await checkExists(prisma.room, roomId, "Room Does not exists");

//   const res = await prisma.application.create({
//     data: {
//       message,
//       tenantId,
//       roomId,
//     },
//   });

//   return res;
// };

// const deleteRoom = async (id: string) => {
//   const res = await prisma.room.delete({
//     where: {
//       id,
//     },
//   });

//   return res;
// };

export const ownerServices = {
  updateApplicationStatus,
};
