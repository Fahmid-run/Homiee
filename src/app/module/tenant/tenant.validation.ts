import z from "zod";

const ViewReqZodSchema = z.object({
  messsage: z
    .string("Provide a String!")
    .min(10, "Provide Minimum 10 Character")
    .max(30, "Max ^ characters"),
  requestedDate: z.ZodISODateTime,

  propertyId: z.string("Plz provide valid id"),
  roomId: z.string("Plz provide valid id"),
  tenantId: z.string("Plz provide valid id"),
});

const ApplcationZodSchema = z.object({
  messsage: z
    .string("Provide a String!")
    .min(10, "Provide Minimum 10 Character")
    .max(30, "Max ^ characters"),

  roomId: z.string("Plz provide valid id"),
  tenantId: z.string("Plz provide valid id"),
});

export const tenantDataValidator = {
  ViewReqZodSchema,
  ApplcationZodSchema,
};
