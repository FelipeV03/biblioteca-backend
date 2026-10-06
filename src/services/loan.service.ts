import { sequelize } from "../models";
import { BusinessRuleError } from "../errors/BusinessRuleError";
import { NotFoundError } from "../errors/NotFoundError";
import { bookRepository } from "../repositories/book.repository";
import { loanRepository } from "../repositories/loan.repository";
import { userRepository } from "../repositories/user.repository";
import type { CreateLoanInput, ListLoansQuery } from "../validators/loan.schema";

export const LOAN_PERIOD_DAYS = 14;
export const MAX_ACTIVE_LOANS_PER_USER = 2;

export type LoanDisplayStatus = "active" | "overdue" | "returned";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function computeLoanStatus(loan: { status: "active" | "returned"; dueDate: string }): LoanDisplayStatus {
  if (loan.status === "returned") {
    return "returned";
  }
  return loan.dueDate < todayISO() ? "overdue" : "active";
}

function withDisplayStatus<T extends { toJSON: () => Record<string, unknown> } & { status: "active" | "returned"; dueDate: string }>(
  loan: T,
) {
  return { ...loan.toJSON(), displayStatus: computeLoanStatus(loan) };
}

export const loanService = {
  async list(query: ListLoansQuery) {
    const { rows, count } = await loanRepository.findAll(query);

    return {
      data: rows.map(withDisplayStatus),
      meta: {
        page: query.page,
        limit: query.limit,
        total: count,
      },
    };
  },

  async getById(id: number) {
    const loan = await loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundError("Préstamo no encontrado");
    }
    return withDisplayStatus(loan);
  },

  async create(input: CreateLoanInput) {
    const book = await bookRepository.findById(input.bookId);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }
    if (!book.isAvailable) {
      throw new BusinessRuleError("El libro no está disponible", "BOOK_NOT_AVAILABLE");
    }

    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    const activeLoans = await loanRepository.countActiveByUser(input.userId);
    if (activeLoans >= MAX_ACTIVE_LOANS_PER_USER) {
      throw new BusinessRuleError("El usuario ya alcanzó el máximo de préstamos activos", "MAX_ACTIVE_LOANS");
    }

    const loanDate = todayISO();
    const dueDate = addDaysISO(loanDate, LOAN_PERIOD_DAYS);

    const loan = await sequelize.transaction(async (transaction) => {
      const createdLoan = await loanRepository.create(
        { bookId: input.bookId, userId: input.userId, loanDate, dueDate },
        transaction,
      );
      await bookRepository.update(input.bookId, { isAvailable: false }, transaction);
      return createdLoan;
    });

    const loanWithRelations = await loanRepository.findById(loan.id);
    return withDisplayStatus(loanWithRelations!);
  },

  async returnLoan(id: number) {
    const loan = await loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundError("Préstamo no encontrado");
    }
    if (loan.status === "returned") {
      throw new BusinessRuleError("El préstamo ya fue devuelto", "LOAN_ALREADY_RETURNED");
    }

    await sequelize.transaction(async (transaction) => {
      await loanRepository.markReturned(id, todayISO(), transaction);
      await bookRepository.update(loan.bookId, { isAvailable: true }, transaction);
    });

    const updatedLoan = await loanRepository.findById(id);
    return withDisplayStatus(updatedLoan!);
  },
};
