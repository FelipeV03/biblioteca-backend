import { Op } from "sequelize";
import { statsRepository } from "../repositories/stats.repository";
import { todayISO } from "./loan.service";

export interface LoanDurationInput {
  loanDate: string;
  returnedAt: string | null;
}

export function computeAverageLoanDuration(loans: LoanDurationInput[]): number | null {
  const durations = loans
    .filter((loan): loan is LoanDurationInput & { returnedAt: string } => Boolean(loan.returnedAt))
    .map((loan) => {
      const start = new Date(`${loan.loanDate}T00:00:00.000Z`).getTime();
      const end = new Date(`${loan.returnedAt}T00:00:00.000Z`).getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    });

  if (durations.length === 0) {
    return null;
  }

  const average = durations.reduce((sum, days) => sum + days, 0) / durations.length;
  return Math.round(average * 10) / 10;
}

export const statsService = {
  async topBooks(limit: number) {
    const rows = await statsRepository.topBooks(limit);

    return rows.map((row) => {
      const json = row.toJSON() as unknown as {
        bookId: number;
        loanCount: string;
        book: { title: string; author: string; genre: string };
      };

      return {
        bookId: json.bookId,
        title: json.book?.title,
        author: json.book?.author,
        genre: json.book?.genre,
        loanCount: Number(json.loanCount),
      };
    });
  },

  async loansSummary() {
    const today = todayISO();

    const [active, overdue, returned] = await Promise.all([
      statsRepository.countLoans({ status: "active", dueDate: { [Op.gte]: today } }),
      statsRepository.countLoans({ status: "active", dueDate: { [Op.lt]: today } }),
      statsRepository.countLoans({ status: "returned" }),
    ]);

    return { active, overdue, returned, total: active + overdue + returned };
  },

  async availabilityByGenre() {
    const rows = await statsRepository.availabilityByGenre();

    return rows.map((row) => {
      const json = row.toJSON() as unknown as { genre: string; total: string; available: string };
      const total = Number(json.total);
      const available = Number(json.available);
      return { genre: json.genre, total, available, borrowed: total - available };
    });
  },

  async averageLoanDuration() {
    const loans = await statsRepository.returnedLoanDurations();
    const sampleSize = loans.filter((loan) => loan.returnedAt).length;
    return { averageDays: computeAverageLoanDuration(loans), sampleSize };
  },
};
