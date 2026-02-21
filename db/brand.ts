import prisma from "./prisma";

export default class ProductBrandDB {
  static async list() {
    return await prisma.productBrand.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async create(name: string, logo?: string) {
    return await prisma.productBrand.create({
      data: { name, logo },
    });
  }

  static async findById(id: string) {
    return await prisma.productBrand.findUnique({
      where: { id },
    });
  }

  static async update(id: string, name?: string, logo?: string | null) {
    return await prisma.productBrand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
      },
    });
  }

  static async delete(id: string) {
    return await prisma.productBrand.delete({
      where: { id },
    });
  }
}
