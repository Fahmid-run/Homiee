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

export const AdminService = {
  banUserFromDb,
  getStats,
};
