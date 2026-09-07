import { ApplicationStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
import httpstatus from "http-status";

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
    throw new AppError("Application Does not exists", httpstatus.NOT_FOUND);
  }

  const propertyData = await prisma.property.findUnique({
    where: {
      id: applicationData.room.propertyId,
    },
  });

  if (ownerId !== propertyData?.ownerId) {
    throw new AppError("Forbidden", httpstatus.FORBIDDEN);
  }

  if (
    applicationData.status !== "APPROVED" ||
    applicationData.status !== "REJECTED" ||
    applicationData.status !== "WITHDRAWN"
  ) {
    const transaction = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: {
          id: applicationData.roomId,
        },
      });

      console.log(room);
      const occupied = await tx.tenancy.count({
        where: {
          status: "ACTIVE",
        },
      });

      if (occupied >= room?.capacity!) {
        throw new AppError("No seat left for this room", httpstatus.NOT_FOUND);
      }

      const tenancyStartDate = new Date();

      const tenancy = await prisma.tenancy.create({
        data: {
          startDate: tenancyStartDate,
          securityDeposit: "0",
          tenantId: applicationData.tenantId,
          applicationId,
          monthlyRent: room?.monthlyRent!,
          roomId: applicationData.roomId,
        },
      });

      console.log(tenancy);

      const res = await prisma.application.update({
        where: {
          id: applicationId,
        },
        data: {
          status: "APPROVED",
          reviewedBy: userid,
        },
        include: {
          tenancy: true,
        },
      });

      if (occupied + 1 == room?.capacity) {
        await tx.room.update({
          where: {
            id: applicationData.roomId,
          },
          data: {
            roomstatus: "FULL",
          },
        });
      } else {
        await tx.room.update({
          where: {
            id: applicationData.roomId,
          },
          data: {
            roomstatus: "PARTIALLY_OCCUPIED",
          },
        });
      }

      return res;
    });

    console.log(transaction);

    return transaction;
  } else {
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
  }
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
    throw new AppError("Request Does not exists", httpstatus.NOT_FOUND);
  }

  const propertyData = await prisma.property.findUnique({
    where: {
      id: viewReqData.propertyId,
    },
  });

  if (ownerId !== propertyData?.ownerId) {
    throw new AppError("Forbidden", httpstatus.FORBIDDEN);
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
