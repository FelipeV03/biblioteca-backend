import { NotFoundError } from "../../src/errors/NotFoundError";
import { ValidationError } from "../../src/errors/ValidationError";
import { bookRepository } from "../../src/repositories/book.repository";
import { bookService } from "../../src/services/book.service";

jest.mock("../../src/repositories/book.repository", () => ({
  bookRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIsbn: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedRepo = bookRepository as jest.Mocked<typeof bookRepository>;

describe("bookService", () => {
  describe("list", () => {
    it("devuelve los libros junto con la metadata de paginación", async () => {
      mockedRepo.findAll.mockResolvedValue({ rows: [{ id: 1 }] as never, count: 1 });

      const result = await bookService.list({ page: 1, limit: 10 });

      expect(result).toEqual({ data: [{ id: 1 }], meta: { page: 1, limit: 10, total: 1 } });
    });
  });

  describe("getById", () => {
    it("lanza NotFoundError si el libro no existe", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(bookService.getById(99)).rejects.toThrow(NotFoundError);
    });

    it("retorna el libro si existe", async () => {
      const book = { id: 1, title: "1984" };
      mockedRepo.findById.mockResolvedValue(book as never);

      await expect(bookService.getById(1)).resolves.toBe(book);
    });
  });

  describe("create", () => {
    it("lanza ValidationError si el ISBN ya está registrado", async () => {
      mockedRepo.findByIsbn.mockResolvedValue({ id: 5 } as never);

      await expect(
        bookService.create({ title: "A", author: "B", genre: "C", isbn: "123" }),
      ).rejects.toThrow(ValidationError);

      expect(mockedRepo.create).not.toHaveBeenCalled();
    });

    it("crea el libro cuando el ISBN no está repetido", async () => {
      mockedRepo.findByIsbn.mockResolvedValue(null);
      mockedRepo.create.mockResolvedValue({ id: 1 } as never);

      const result = await bookService.create({ title: "A", author: "B", genre: "C", isbn: "123" });

      expect(mockedRepo.create).toHaveBeenCalledWith({ title: "A", author: "B", genre: "C", isbn: "123" });
      expect(result).toEqual({ id: 1 });
    });

    it("crea el libro sin exigir ISBN", async () => {
      mockedRepo.create.mockResolvedValue({ id: 2 } as never);

      await bookService.create({ title: "A", author: "B", genre: "C" });

      expect(mockedRepo.findByIsbn).not.toHaveBeenCalled();
      expect(mockedRepo.create).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("lanza NotFoundError si el libro no existe", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(bookService.update(1, { title: "Nuevo" })).rejects.toThrow(NotFoundError);
    });

    it("lanza ValidationError si el nuevo ISBN pertenece a otro libro", async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRepo.findByIsbn.mockResolvedValue({ id: 2 } as never);

      await expect(bookService.update(1, { isbn: "999" })).rejects.toThrow(ValidationError);
    });

    it("actualiza el libro cuando el ISBN pertenece al mismo libro", async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRepo.findByIsbn.mockResolvedValue({ id: 1 } as never);
      mockedRepo.update.mockResolvedValue({ id: 1, isbn: "999" } as never);

      const result = await bookService.update(1, { isbn: "999" });

      expect(mockedRepo.update).toHaveBeenCalledWith(1, { isbn: "999" });
      expect(result).toEqual({ id: 1, isbn: "999" });
    });
  });

  describe("remove", () => {
    it("lanza NotFoundError si el libro no existe", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(bookService.remove(1)).rejects.toThrow(NotFoundError);
      expect(mockedRepo.delete).not.toHaveBeenCalled();
    });

    it("elimina el libro si existe", async () => {
      mockedRepo.findById.mockResolvedValue({ id: 1 } as never);
      mockedRepo.delete.mockResolvedValue(true);

      await bookService.remove(1);

      expect(mockedRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
