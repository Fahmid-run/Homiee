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

const uploadDocuments = async (userId: string, tenancyId: string, payload) => {
  const { type, fileUrl } = payload;
  await checkExists(prisma.tenancy, tenancyId, "Tenancy Does not exist");

  const res = await prisma.rentalDocuments.create({
    data: {
      tenancyId,
      type,
      fileUrl,
      uploadedBy: userId,
    },
  });

  return res;
};

const createBill = async (ownerId: string, roomId: string, payload) => {
  const {
    type,
    description,
    billPeriodStart,
    billPeriodEnd,
    totalAmount,
    dueDate,
    status,
  } = payload;

  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      property: true,
    },
  });

  if (!room) {
    throw new AppError("Room does not exist", httpstatus.NOT_FOUND);
  }

  if (ownerId !== room.property.ownerId) {
    throw new AppError("Forbidden ", httpstatus.FORBIDDEN);
  }
  // const isBillExists = await prisma.utilityBill.findUnique({
  //   where: {
  //     id:roomId,
  //     roomId,
  //   },
  // });
  // if (isBillExists) {
  //   throw new AppError("bill already exists", httpstatus.NOT_FOUND);
  // }

  const transaction = await prisma.$transaction(async (tx) => {
    const billCreate = await tx.utilityBill.create({
      data: {
        type,
        description,
        billPeriodStart,
        billPeriodEnd,
        totalAmount,
        dueDate,
        status,
        roomId,
      },
    });

    const tenants = await tx.tenancy.findMany({
      where: {
        roomId,
        status: TenancyStatus.ACTIVE,
      },
    });

    if (tenants.length === 0) {
      throw new AppError(
        "No active tenants in this room",
        httpstatus.BAD_REQUEST,
      );
    }

    const baseAmount = Math.floor(billCreate.totalAmount / tenants.length);

    const remainder = billCreate.totalAmount % tenants.length;

    for (let i = 0; i < tenants.length; i++) {
      const amount = baseAmount + (i < remainder ? 1 : 0);

      await tx.utilityBillShare.create({
        data: {
          billid: billCreate.id,
          tenantId: tenants[i].tenantId,
          tenancyId: tenants[i].id,
          amount,
          dueDate: billCreate.dueDate,
        },
      });
    }

    return tx.utilityBill.findUnique({
      where: {
        id: billCreate.id,
      },
      include: {
        shares: true,
      },
    });
  });

  return transaction;
};

const getMyPropertyBills = async (ownerId: string) => {
  const res = await prisma.utilityBill.findMany({
    where: {
      room: {
        property: {
          ownerId,
        },
      },
    },
    include: {
      shares: true,
    },
  });

  return res;
};

export const ownerServices = {
  updateViewReqStatus,
  updateApplicationStatus,
  uploadDocuments,
  createBill,
  getMyPropertyBills,
};
