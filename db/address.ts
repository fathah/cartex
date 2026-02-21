import prisma from "./prisma";

export type CreateAddressData = {
  customerId: string;
  type?: string;
  fullname?: string;
  addressType?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip?: string;
  country: string;
  phone?: string;
};

export default class AddressDB {
  static async create(data: CreateAddressData) {
    return await prisma.address.create({
      data,
    });
  }

  static async listByCustomer(customerId: string) {
    return await prisma.address.findMany({
      where: { customerId },
    });
  }

  static async delete(id: string) {
    return await prisma.address.delete({
      where: { id },
    });
  }

  static async update(id: string, data: Partial<CreateAddressData>) {
    return await prisma.address.update({
      where: { id },
      data,
    });
  }
}
