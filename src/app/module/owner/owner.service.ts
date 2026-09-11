import {
  ApplicationStatus,
  RentalDocumentsType,
  TenancyStatus,
  ViewingStatus,
} from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/appError";
import { checkExists } from "../../utils/checkExist";
import httpstatus from "http-status";
import { CreateBillPayload } from "./owner.interface";

const updateApplicationStatus = async (
  userid: string,
  ownerId: string,
  applicationId: string,
  payload: {
    status: ApplicationStatus;
  },
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

const updateViewReqStatus = async (
  ownerId: string,
  id: string,
  payload: { status: ViewingStatus },
) => {
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

const uploadDocuments = async (
  userId: string,
  tenancyId: string,
  payload: { type: RentalDocumentsType; fileUrl: string },
) => {
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

const createBill = async (
  ownerId: string,
  roomId: string,
  payload: CreateBillPayload,
) => {
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
  const isBillExists = await prisma.utilityBill.findFirst({
    where: {
      roomId,
    },
  });
  if (isBillExists) {
    throw new AppError("bill already exists", httpstatus.BAD_REQUEST);
  }

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

const createRental = async (
  ownerId: string,
  roomId: string,
  payload: { dueDate: Date },
) => {
  console.log(new Date());
  const { dueDate } = payload;

  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      property: true,
      tenancy: true,
    },
  });

  if (!room) {
    throw new AppError("Room does not exist", httpstatus.NOT_FOUND);
  }

  if (ownerId !== room.property.ownerId) {
    throw new AppError("Forbidden ", httpstatus.FORBIDDEN);
  }
  const isRentalExists = await prisma.rental.findFirst({
    where: {
      roomId,
    },
  });
  if (isRentalExists) {
    throw new AppError("bill already exists", httpstatus.BAD_REQUEST);
  }

  if (room.tenancy.length === 0) {
    throw new AppError(
      "Sry there is no tenant there. YOu can not create rental!!!",
      httpstatus.BAD_REQUEST,
    );
  }

  const rentalCreate = await prisma.rental.create({
    data: {
      amount: room.monthlyRent,
      dueDate,
      roomId,
    },
  });

  return rentalCreate;
};

export const ownerServices = {
  updateViewReqStatus,
  updateApplicationStatus,
  uploadDocuments,
  createBill,
  getMyPropertyBills,
  createRental,
};
