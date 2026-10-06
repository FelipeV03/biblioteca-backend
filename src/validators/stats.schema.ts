import { z } from "zod";

export const topBooksQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export type TopBooksQuery = z.infer<typeof topBooksQuerySchema>;
