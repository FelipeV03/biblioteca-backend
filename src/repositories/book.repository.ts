import { Op, type Attributes, type WhereOptions } from "sequelize";
import { Book } from "../models";
import type { Book as BookModel } from "../models/Book";

export interface ListBooksFilters {
  genre?: string;
  available?: boolean;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  genre: string;
  isbn?: string;
  publishedYear?: number;
}

export type UpdateBookData = Partial<Omit<CreateBookData, "isbn" | "publishedYear">> & {
  isbn?: string | null;
  publishedYear?: number | null;
  isAvailable?: boolean;
};

function buildWhere(filters: Pick<ListBooksFilters, "genre" | "available" | "search">): WhereOptions<Attributes<BookModel>> {
  const conditions: WhereOptions<Attributes<BookModel>>[] = [];

  if (filters.genre) {
    conditions.push({ genre: filters.genre });
  }

  if (filters.available !== undefined) {
    conditions.push({ isAvailable: filters.available });
  }

  if (filters.search) {
    const like = `%${filters.search}%`;
    conditions.push({
      [Op.or]: [{ title: { [Op.like]: like } }, { author: { [Op.like]: like } }],
    });
  }

  return conditions.length > 0 ? { [Op.and]: conditions } : {};
}

export const bookRepository = {
  async findAll(filters: ListBooksFilters) {
    const where = buildWhere(filters);

    const { rows, count } = await Book.findAndCountAll({
      where,
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      order: [["createdAt", "DESC"]],
    });

    return { rows, count };
  },

  findById(id: number) {
    return Book.findByPk(id);
  },

  findByIsbn(isbn: string) {
    return Book.findOne({ where: { isbn } });
  },

  create(data: CreateBookData) {
    return Book.create(data);
  },

  async update(id: number, data: UpdateBookData) {
    const book = await Book.findByPk(id);
    if (!book) return null;
    return book.update(data);
  },

  async delete(id: number) {
    const book = await Book.findByPk(id);
    if (!book) return false;
    await book.destroy();
    return true;
  },
};
