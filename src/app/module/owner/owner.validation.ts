import z from "zod";
import { RentalDocumentsType } from "../../../../prisma/generated/prisma/enums";

const UploadDocsZodSchema = z.object({
  tenancyId: z.string("Plz provide valid id"),
  type: z.enum([
    RentalDocumentsType.IDENTITY,
    RentalDocumentsType.LEASE,
    RentalDocumentsType.OTHER,
    RentalDocumentsType.AGGREEMENT,
  ]),
  fileUrl: z.url(),
  uploadedBy: z.string("Plz provide valid id"),
});

export const ownerZodValidation = {
  UploadDocsZodSchema,
};
