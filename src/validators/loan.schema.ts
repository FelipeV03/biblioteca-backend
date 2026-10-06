import { z } from "zod";

export const createLoanSchema = z.object({
  bookId: z.coerce.number().int().positive("Debes seleccionar un libro"),
  userId: z.coerce.number().int().positive("Debes seleccionar un usuario"),
});

export const listLoansQuerySchema = z.object({
  status: z.enum(["active", "overdue", "returned"]).optional(),
  userId: z.coerce.number().int().positive().optional(),
  bookId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const loanIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Id inválido"),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ListLoansQuery = z.infer<typeof listLoansQuerySchema>;
