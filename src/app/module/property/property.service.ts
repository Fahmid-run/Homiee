import { prisma } from "../../lib/prisma";

const createProperty = async (ownerId: string, payload) => {
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
};
