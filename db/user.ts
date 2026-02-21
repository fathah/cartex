import prisma from "./prisma";
import { UserRole, Prisma } from "@prisma/client";

export type CreateUserData = {
  email: string;
  passwordHash?: string;
  fullname?: string;
  role?: UserRole;
  ziqxId?: string | null;
};

export default class UserDB {
  static async count() {
    return await prisma.user.count();
  }
  static async findByZiqxId(ziqxId: string) {
    return await prisma.user.findUnique({
      where: { ziqxId },
    });
  }

  static async create(data: CreateUserData) {
    return await prisma.user.create({
      data,
    });
  }

  static async findByEmail(email: string) {
    const lowerCaseEmail = email.toLowerCase();
    return await prisma.user.findUnique({
      where: { email: lowerCaseEmail },
    });
  }

  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async list(role?: UserRole) {
    return await prisma.user.findMany({
      where: {
        role,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
