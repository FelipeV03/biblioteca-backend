import { ForeignKeyConstraintError } from "sequelize";
import { BusinessRuleError } from "../errors/BusinessRuleError";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { bookRepository } from "../repositories/book.repository";
import { loanRepository } from "../repositories/loan.repository";
import type { CreateBookInput, ListBooksQuery, UpdateBookInput } from "../validators/book.schema";

export const bookService = {
  async list(query: ListBooksQuery) {
    const { rows, count } = await bookRepository.findAll(query);

    return {
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total: count,
      },
    };
  },

  async getById(id: number) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }
    return book;
  },

  async create(input: CreateBookInput) {
    if (input.isbn) {
      const existing = await bookRepository.findByIsbn(input.isbn);
      if (existing) {
        throw new ValidationError("Ya existe un libro con ese ISBN", { isbn: ["El ISBN ya está registrado"] });
      }
    }

    return bookRepository.create(input);
  },

  async update(id: number, input: UpdateBookInput) {
    await this.getById(id);

    if (input.isbn) {
      const existing = await bookRepository.findByIsbn(input.isbn);
      if (existing && existing.id !== id) {
        throw new ValidationError("Ya existe un libro con ese ISBN", { isbn: ["El ISBN ya está registrado"] });
      }
    }

    return bookRepository.update(id, input);
  },

  async remove(id: number) {
    await this.getById(id);

    const activeLoans = await loanRepository.countActiveByBook(id);
    if (activeLoans > 0) {
      throw new BusinessRuleError("No se puede eliminar un libro con préstamos activos", "BOOK_HAS_ACTIVE_LOANS");
    }

    try {
      await bookRepository.delete(id);
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        throw new BusinessRuleError(
          "No se puede eliminar un libro con historial de préstamos (incluye préstamos ya devueltos)",
          "BOOK_HAS_LOAN_HISTORY",
        );
      }
      throw error;
    }
  },
};
