import { Op, fn, col, literal, type WhereOptions } from "sequelize";
import { Book, Loan } from "../models";
import type { Loan as LoanModel } from "../models/Loan";

export const statsRepository = {
  topBooks(limit: number) {
    return Loan.findAll({
      attributes: ["bookId", [fn("COUNT", col("Loan.id")), "loanCount"]],
      include: [{ model: Book, as: "book", attributes: ["id", "title", "author", "genre"] }],
      group: ["bookId", "book.id"],
      order: [[literal("loanCount"), "DESC"]],
      limit,
      subQuery: false,
    });
  },

  countLoans(where: WhereOptions<Pick<LoanModel, "status" | "dueDate">>) {
    return Loan.count({ where });
  },

  availabilityByGenre() {
    return Book.findAll({
      attributes: [
        "genre",
        [fn("COUNT", col("id")), "total"],
        [fn("SUM", literal("CASE WHEN is_available = true THEN 1 ELSE 0 END")), "available"],
      ],
      group: ["genre"],
      order: [["genre", "ASC"]],
    });
  },

  returnedLoanDurations() {
    return Loan.findAll({
      where: { status: "returned", returnedAt: { [Op.ne]: null } },
      attributes: ["loanDate", "returnedAt"],
      raw: true,
    });
  },
};
