import { prisma } from "../../lib/prisma";

const getAllProperties = async () => {
  const res = await prisma.property.findMany();

  return res;
};

const PublicServices = {
  getAllProperties,
};
