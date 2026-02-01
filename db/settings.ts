import prisma from './prisma';

export interface UpdateSettingsData {
  storeName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeConfig?: any;
  currency?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default class SettingsDB {
  private static GLOBAL_ID = "global";

  /**
   * Get the global settings. Creates default settings atomically if not found.
   * Uses upsert to prevent race conditions during parallel builds.
   */
  static async get() {
    return await prisma.settings.upsert({
      where: { id: this.GLOBAL_ID },
      update: {}, // Don't update if exists
      create: {
        id: this.GLOBAL_ID,
        storeName: "My Store",
        currency: "USD",
        themeConfig: {},
      },
    });
  }

  /**
   * Update global settings.
   */
  static async update(data: UpdateSettingsData) {
    // Ensure settings exist first
    await this.get();

    return await prisma.settings.update({
      where: { id: this.GLOBAL_ID },
      data,
    });
  }
}
