import { Op, type Transaction } from "sequelize";
import { Book, Loan, User } from "../models";
import type { LoanStatus } from "../models/Loan";

export interface ListLoansFilters {
  status?: "active" | "overdue" | "returned";
  userId?: number;
  bookId?: number;
  page: number;
  limit: number;
}

export interface CreateLoanData {
  bookId: number;
  userId: number;
  loanDate: string;
  dueDate: string;
}

const include = [
  { model: Book, as: "book" },
  { model: User, as: "user" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildWhere(filters: Pick<ListLoansFilters, "status" | "userId" | "bookId">) {
  const conditions: Record<string, unknown>[] = [];

  if (filters.userId) {
    conditions.push({ userId: filters.userId });
  }

  if (filters.bookId) {
    conditions.push({ bookId: filters.bookId });
  }

  if (filters.status === "returned") {
    conditions.push({ status: "returned" });
  } else if (filters.status === "active") {
    conditions.push({ status: "active", dueDate: { [Op.gte]: todayISO() } });
  } else if (filters.status === "overdue") {
    conditions.push({ status: "active", dueDate: { [Op.lt]: todayISO() } });
  }

  return conditions.length > 0 ? { [Op.and]: conditions } : {};
}

export const loanRepository = {
  async findAll(filters: ListLoansFilters) {
    const where = buildWhere(filters);

    const { rows, count } = await Loan.findAndCountAll({
      where,
      include,
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      order: [["createdAt", "DESC"]],
    });

    return { rows, count };
  },

  findById(id: number) {
    return Loan.findByPk(id, { include });
  },

  countActiveByUser(userId: number, transaction?: Transaction) {
    return Loan.count({ where: { userId, status: "active" as LoanStatus }, transaction });
  },

  countActiveByBook(bookId: number) {
    return Loan.count({ where: { bookId, status: "active" as LoanStatus } });
  },

  create(data: CreateLoanData, transaction?: Transaction) {
    return Loan.create(data, { transaction });
  },

  async markReturned(id: number, returnedAt: string, transaction?: Transaction) {
    const loan = await Loan.findByPk(id, { transaction });
    if (!loan) return null;
    return loan.update({ returnedAt, status: "returned" }, { transaction });
  },
};
