import { computeAverageLoanDuration } from "../../src/services/stats.service";

describe("computeAverageLoanDuration", () => {
  it("retorna null si no hay préstamos devueltos", () => {
    expect(computeAverageLoanDuration([])).toBeNull();
    expect(computeAverageLoanDuration([{ loanDate: "2025-01-01", returnedAt: null }])).toBeNull();
  });

  it("calcula el promedio de días entre loanDate y returnedAt", () => {
    const loans = [
      { loanDate: "2025-01-01", returnedAt: "2025-01-11" }, // 10 días
      { loanDate: "2025-01-01", returnedAt: "2025-01-15" }, // 14 días
    ];

    expect(computeAverageLoanDuration(loans)).toBe(12);
  });

  it("ignora los préstamos aún no devueltos al calcular el promedio", () => {
    const loans = [
      { loanDate: "2025-01-01", returnedAt: "2025-01-11" }, // 10 días
      { loanDate: "2025-01-01", returnedAt: null },
    ];

    expect(computeAverageLoanDuration(loans)).toBe(10);
  });

  it("redondea el promedio a un decimal", () => {
    const loans = [
      { loanDate: "2025-01-01", returnedAt: "2025-01-05" }, // 4 días
      { loanDate: "2025-01-01", returnedAt: "2025-01-06" }, // 5 días
      { loanDate: "2025-01-01", returnedAt: "2025-01-06" }, // 5 días
    ];

    expect(computeAverageLoanDuration(loans)).toBe(4.7);
  });
});
