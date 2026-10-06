import { z } from "zod";

const currentYear = new Date().getFullYear();

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(255),
  author: z.string().trim().min(1, "El autor es obligatorio").max(255),
  genre: z.string().trim().min(1, "El género es obligatorio").max(100),
  isbn: z.string().trim().min(1).max(20).optional(),
  publishedYear: z.coerce
    .number()
    .int()
    .min(1400, "Año de publicación inválido")
    .max(currentYear, "El año no puede ser futuro")
    .optional(),
});

export const updateBookSchema = createBookSchema.partial().extend({
  isbn: z.string().trim().min(1).max(20).nullable().optional(),
  publishedYear: z.coerce
    .number()
    .int()
    .min(1400, "Año de publicación inválido")
    .max(currentYear, "El año no puede ser futuro")
    .nullable()
    .optional(),
  isAvailable: z.boolean().optional(),
});

export const listBooksQuerySchema = z.object({
  genre: z.string().trim().min(1).optional(),
  available: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const bookIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Id inválido"),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;
