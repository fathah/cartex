import prisma from "./prisma";

export default class CustomerDB {
  static async create(data: {
    fullName: string;
    email: string;
    phone?: string;
    isGuest?: boolean;
  }) {
    return await prisma.customer.create({
      data,
    });
  }

  static async findByEmail(email: string) {
    return await prisma.customer.findFirst({
      where: { email },
      include: { addresses: true },
    });
  }

  static async findById(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
      include: { addresses: true },
    });
  }

  static async list({ page = 1, limit = 10, search = "" } = {}) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  static async count() {
    return await prisma.customer.count();
  }
}
