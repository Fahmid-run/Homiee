import { Prisma } from "../../client";
import { prisma } from "../../lib/prisma";
import { PropertyPayload, SearchPropertiesQuery } from "./property.interface";

const createProperty = async (ownerId: string, payload: PropertyPayload) => {
  const { name, address, description, city, totalrooms } = payload;

  const res = await prisma.property.create({
    data: {
      name,
      address,
      description,
      city,
      totalrooms,
      ownerId,
    },
  });

  return res;
};

const getAllProperties = async () => {
  const res = await prisma.property.findMany({});

  return res;
};

export const searchProperties = async (query: SearchPropertiesQuery) => {
  const {
    searchTerm,
    city,
    minRent,
    maxRent,
    roomType,
    availableRoomsOnly,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const andConditions: Prisma.PropertyWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { address: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { city: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (city) {
    andConditions.push({ city: { equals: city, mode: "insensitive" } });
  }

  const roomFilter: Prisma.RoomWhereInput = {};

  if (minRent !== undefined || maxRent !== undefined) {
    roomFilter.monthlyRent = {
      ...(minRent !== undefined && { gte: Number(minRent) }),
      ...(maxRent !== undefined && { lte: Number(maxRent) }),
    };
  }

  if (roomType) {
    roomFilter.roomType = roomType;
  }

  if (availableRoomsOnly) {
    roomFilter.roomstatus = "AVAILABLE";
  }

  if (Object.keys(roomFilter).length > 0) {
    andConditions.push({
      rooms: {
        some: roomFilter,
      },
    });
  }

  const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

  // 2. Pagination calculation
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // 3. Execute query & count concurrently
  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      include: {
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            monthlyRent: true,
            roomType: true,
            roomstatus: true,
          },
        },
        owner: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take,
    }),
    prisma.property.count({ where: whereClause }),
  ]);

  // 4. Return paginated meta-response
  const totalPages = Math.ceil(totalCount / take);

  return {
    meta: {
      totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1,
    },
    data: properties,
  };
};

const getPropertiesById = async (id: string) => {
  const res = await prisma.property.findUnique({
    where: {
      id,
    },
  });

  return res;
};

const getPropertiesByOwnerId = async (ownerId: string) => {
  const res = await prisma.property.findMany({
    where: {
      ownerId,
    },
  });

  return res;
};

const deleteProperty = async (id: string) => {
  const res = await prisma.property.delete({
    where: {
      id,
    },
  });

  return res;
};

export const propertyServices = {
  createProperty,
  getAllProperties,
  getPropertiesById,
  getPropertiesByOwnerId,
  deleteProperty,
  searchProperties,
};
