import prisma from "./prisma";

export default class MarketDB {
  static async list() {
    return await prisma.market.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return await prisma.market.findUnique({
      where: { id },
    });
  }

  static async findByCode(code: string) {
    return await prisma.market.findUnique({
      where: { code },
    });
  }

  static async create(data: {
    name: string;
    code: string;
    countryCode: string;
    currencyCode: string;
  }) {
    return await prisma.market.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  static async update(id: string, data: { name?: string; isActive?: boolean }) {
    return await prisma.market.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.market.delete({
      where: { id },
    });
  }
}
