import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  email: z.string().trim().min(1, "El email es obligatorio").email("Email inválido").max(255),
  documentNumber: z
    .string()
    .trim()
    .min(5, "El número de documento debe tener al menos 5 dígitos")
    .max(20, "Máximo 20 dígitos")
    .regex(/^\d+$/, "El número de documento solo puede contener números"),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Id inválido"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
