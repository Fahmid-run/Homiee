import { PaymentStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { checkExists } from "../../utils/checkExist";

const banUserFromDb = async (userId: string) => {
  await checkExists(prisma.user, userId, "User does not exists");
  const res = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: "BLOCKED",
    },
    omit: {
      password: true,
    },
  });

  return res;
};

const getStats = async () => {
  const statResult = await prisma.$transaction(async (tx) => {
    const [
      totalActiveUsers,
      totalPublishedProperties,
      totalAvailablerooms,
      totalPartiallyOccupiedRooms,
      totalActiveTenancies,
      totalApplicationReq,
      totalViewReq,
    ] = await Promise.all([
      tx.user.count({
        where: {
          status: "ACTIVE",
          role: {
            not: "ADMIN",
          },
        },
      }),

      tx.property.count({
        where: {
          propertyStatus: "PUBLISHED",
        },
      }),
      tx.room.count({
        where: {
          roomstatus: "AVAILABLE",
        },
      }),
      tx.room.count({
        where: {
          roomstatus: "PARTIALLY_OCCUPIED",
        },
      }),
      tx.tenancy.count({
        where: {
          status: "ACTIVE",
        },
      }),
      tx.application.count(),
      tx.viewingRequest.count(),
    ]);

    return {
      totalActiveUsers,
      totalPublishedProperties,
      totalAvailablerooms,
      totalPartiallyOccupiedRooms,
      totalActiveTenancies,
      totalApplicationReq,
      totalViewReq,
    };
  });

  return statResult;
};

const getUsers = async (take: number) => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    include: {
      propertyOwner: true,
      tenantProfile: true,
    },
    take,
  });

  return users;
};

const recentProperties = async () => {
  const properties = await prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return properties;
};

const recenetRooms = async () => {
  const rooms = await prisma.room.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return rooms;
};

const recentRentalPayments = async () => {
  const rooms = await prisma.rental.findMany({
    where: {
      status: {
        in: [PaymentStatus.CANCELLED, PaymentStatus.FAILED, PaymentStatus.PAID],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return rooms;
};

const recentBillPayments = async () => {
  const rooms = await prisma.billPayment.findMany({
    where: {
      status: {
        in: [PaymentStatus.CANCELLED, PaymentStatus.FAILED, PaymentStatus.PAID],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return rooms;
};

export const AdminService = {
  banUserFromDb,
  getStats,
  getUsers,
  recenetRooms,
  recentProperties,
  recentRentalPayments,
  recentBillPayments,
};
