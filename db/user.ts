import prisma from "./prisma";
import { UserRole, Prisma } from "@prisma/client";

export type CreateUserData = {
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  ziqxId: string;
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
    return await prisma.user.findUnique({
      where: { email },
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
