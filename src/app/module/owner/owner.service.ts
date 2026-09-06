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

const updateViewReqStatus = async (ownerId: string, id: string, payload) => {
  const { status } = payload;

  const viewReqData = await prisma.viewingRequest.findUnique({
    where: {
      id,
    },
    include: {
      room: true,
    },
  });

  if (!viewReqData) {
    throw new AppError("Request Does not exists", httpStatus.NOT_FOUND);
  }

  const propertyData = await prisma.property.findUnique({
    where: {
      id: viewReqData.propertyId,
    },
  });

  if (ownerId !== propertyData?.ownerId) {
    throw new AppError("Forbidden", httpStatus.FORBIDDEN);
  }

  const res = await prisma.viewingRequest.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return res;
};

export const ownerServices = {
  updateViewReqStatus,
  updateApplicationStatus,
};
