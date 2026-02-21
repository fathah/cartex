import prisma from "./prisma";

export type CreateProductReviewData = {
  productId: string;
  variantId?: string;
  customerId: string;
  rating: number;
  comment?: string;
};

export default class ProductReviewDB {
  static async create(data: CreateProductReviewData) {
    return await prisma.productReview.create({
      data,
    });
  }

  static async findByProductId(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              fullname: true,
            },
          },
          variant: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.productReview.count({ where: { productId } }),
    ]);

    // Aggregate rating
    const aggregation = await prisma.productReview.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
      averageRating: aggregation._avg.rating || 0,
    };
  }

  static async canCustomerReview(productId: string, customerId: string) {
    // Has the customer already reviewed it?
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId,
        customerId,
      },
      select: { id: true },
    });

    if (existingReview) return false;

    // Has the customer purchased this product?
    const completedOrder = await prisma.order.findFirst({
      where: {
        customerId,
        paymentStatus: "PAID",
        items: {
          some: {
            productId,
          },
        },
      },
      select: { id: true },
    });

    return !!completedOrder;
  }
}
