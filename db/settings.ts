import prisma from "./prisma";

export interface UpdateSettingsData {
  storeName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeConfig?: any;
  currency?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const GLOBAL_ID = "global";

export default class SettingsDB {
  static async get() {
    try {
      const existing = await prisma.settings.findUnique({
        where: { id: GLOBAL_ID },
      });

      if (existing) {
        return existing;
      }

      // If not found, try to create
      return await prisma.settings.create({
        data: {
          id: GLOBAL_ID,
          storeName: "Cartex Store",
          currency: "AED",
          themeConfig: {},
        },
      });
    } catch (error: any) {
      // If creation fails due to unique constraint (parallel build race condition),
      // fetch the record that was created by another process
      if (error.code === "P2002") {
        const settings = await prisma.settings.findUnique({
          where: { id: GLOBAL_ID },
        });
        if (settings) {
          return settings;
        }
      }
      // Re-throw if it's a different error
      throw error;
    }
  }

  static async getStoreName() {
    const settings = await this.get();
    return settings.storeName;
  }

  static async getStoreLogo() {
    const settings = await this.get();
    return settings.logoUrl;
  }

  /**
   * Update global settings.
   */
  static async update(data: UpdateSettingsData) {
    // Ensure settings exist first
    await this.get();

    return await prisma.settings.update({
      where: { id: GLOBAL_ID },
      data,
    });
  }
}
