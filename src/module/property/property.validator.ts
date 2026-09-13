import z from "zod";

const PropertyZodSchema = z.object({
  name: z.string().min(10, "Minimum 10 characters"),
  address: z.string().min(10, "Minimum 10 characters"),
  description: z
    .string()
    .min(10, "Minimum 10 characters")
    .max(40, "Maximum 40 characters")
    .optional(),
  city: z.string(),
  totalrooms: z
    .number("Provide Number!")
    .positive("Plz Provide a valid number")
    .gte(1),
});

export const PropertyZodValidation = {
  PropertyZodSchema,
};
