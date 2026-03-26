import prisma from "./prisma";
import { normalizeEmail } from "@/services/security";

export default class CustomerDB {
  static async create(data: {
    fullname?: string;
    email: string;
    phone?: string;
    isGuest?: boolean;
  }) {
    return await prisma.customer.create({
      data: {
        ...data,
        email: normalizeEmail(data.email),
        normalizedEmail: normalizeEmail(data.email),
      },
    });
  }

  static async findByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    return await prisma.customer.findFirst({
      where: {
        OR: [
          { normalizedEmail },
          { email: { equals: normalizedEmail, mode: "insensitive" } },
        ],
      },
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
        { fullname: { contains: search, mode: "insensitive" } },
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
