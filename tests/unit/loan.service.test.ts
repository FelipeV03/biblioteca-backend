import { BusinessRuleError } from "../../src/errors/BusinessRuleError";
import { NotFoundError } from "../../src/errors/NotFoundError";
import { bookRepository } from "../../src/repositories/book.repository";
import { loanRepository } from "../../src/repositories/loan.repository";
import { userRepository } from "../../src/repositories/user.repository";
import { computeLoanStatus, loanService } from "../../src/services/loan.service";

jest.mock("../../src/models", () => ({
  sequelize: {
    transaction: jest.fn((callback: (transaction: unknown) => Promise<unknown>) => callback({})),
  },
}));

jest.mock("../../src/repositories/book.repository", () => ({
  bookRepository: {
    findById: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../../src/repositories/loan.repository", () => ({
  loanRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    countActiveByUser: jest.fn(),
    countActiveByBook: jest.fn(),
    create: jest.fn(),
    markReturned: jest.fn(),
  },
}));

jest.mock("../../src/repositories/user.repository", () => ({
  userRepository: {
    findById: jest.fn(),
  },
}));

const mockedBookRepo = bookRepository as jest.Mocked<typeof bookRepository>;
const mockedLoanRepo = loanRepository as jest.Mocked<typeof loanRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;

function fakeLoan(overrides: Partial<{ status: "active" | "returned"; dueDate: string }> = {}) {
  const base = { id: 1, bookId: 1, userId: 1, status: "active" as const, dueDate: "2099-01-01", ...overrides };
  return { ...base, toJSON: () => base };
}

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("computeLoanStatus", () => {
  it("retorna 'returned' si el préstamo ya fue devuelto", () => {
    expect(computeLoanStatus({ status: "returned", dueDate: "2024-01-01" })).toBe("returned");
  });

  it("retorna 'overdue' si está activo y la fecha de vencimiento ya pasó", () => {
    expect(computeLoanStatus({ status: "active", dueDate: "2024-12-31" })).toBe("overdue");
  });

  it("retorna 'active' si está activo y la fecha de vencimiento no ha pasado", () => {
    expect(computeLoanStatus({ status: "active", dueDate: "2025-06-01" })).toBe("active");
  });
});

describe("loanService.create", () => {
  it("rechaza el préstamo si el libro no está disponible", async () => {
    mockedBookRepo.findById.mockResolvedValue({ id: 1, isAvailable: false } as never);

    await expect(loanService.create({ bookId: 1, userId: 1 })).rejects.toThrow(BusinessRuleError);
    expect(mockedLoanRepo.create).not.toHaveBeenCalled();
  });

  it("rechaza el préstamo si el libro no existe", async () => {
    mockedBookRepo.findById.mockResolvedValue(null);

    await expect(loanService.create({ bookId: 99, userId: 1 })).rejects.toThrow(NotFoundError);
  });

  it("rechaza el préstamo si el usuario ya tiene 2 préstamos activos", async () => {
    mockedBookRepo.findById.mockResolvedValue({ id: 1, isAvailable: true } as never);
    mockedUserRepo.findById.mockResolvedValue({ id: 1 } as never);
    mockedLoanRepo.countActiveByUser.mockResolvedValue(2);

    await expect(loanService.create({ bookId: 1, userId: 1 })).rejects.toThrow(BusinessRuleError);
    expect(mockedLoanRepo.create).not.toHaveBeenCalled();
  });

  it("calcula due_date a 14 días y marca el libro como no disponible", async () => {
    mockedBookRepo.findById.mockResolvedValue({ id: 1, isAvailable: true } as never);
    mockedUserRepo.findById.mockResolvedValue({ id: 1 } as never);
    mockedLoanRepo.countActiveByUser.mockResolvedValue(0);
    mockedLoanRepo.create.mockResolvedValue({ id: 10 } as never);
    mockedLoanRepo.findById.mockResolvedValue(fakeLoan({ dueDate: "2025-01-15" }) as never);

    await loanService.create({ bookId: 1, userId: 1 });

    expect(mockedLoanRepo.create).toHaveBeenCalledWith(
      { bookId: 1, userId: 1, loanDate: "2025-01-01", dueDate: "2025-01-15" },
      expect.anything(),
    );
    expect(mockedBookRepo.update).toHaveBeenCalledWith(1, { isAvailable: false }, expect.anything());
  });
});

describe("loanService.returnLoan", () => {
  it("lanza NotFoundError si el préstamo no existe", async () => {
    mockedLoanRepo.findById.mockResolvedValue(null);

    await expect(loanService.returnLoan(1)).rejects.toThrow(NotFoundError);
  });

  it("lanza BusinessRuleError si el préstamo ya fue devuelto", async () => {
    mockedLoanRepo.findById.mockResolvedValue(fakeLoan({ status: "returned" }) as never);

    await expect(loanService.returnLoan(1)).rejects.toThrow(BusinessRuleError);
    expect(mockedLoanRepo.markReturned).not.toHaveBeenCalled();
  });

  it("marca el préstamo como devuelto y libera el libro", async () => {
    mockedLoanRepo.findById
      .mockResolvedValueOnce(fakeLoan({ status: "active" }) as never)
      .mockResolvedValueOnce(fakeLoan({ status: "returned" }) as never);

    await loanService.returnLoan(1);

    expect(mockedLoanRepo.markReturned).toHaveBeenCalledWith(1, "2025-01-01", expect.anything());
    expect(mockedBookRepo.update).toHaveBeenCalledWith(1, { isAvailable: true }, expect.anything());
  });
});
