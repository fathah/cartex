import prisma from "./prisma";

const OPENROUTER_API_KEY = "ai.openrouter.apiKey";
const OPENROUTER_MODEL = "ai.openrouter.model";

export interface AIAutomationConfig {
  openrouterApiKey: string | null;
  openrouterModel: string | null;
}

export interface AIAutomationConfigData {
  openrouterApiKey?: string | null;
  openrouterModel?: string | null;
}

export default class ConfigDB {
  static async getAIAutomationSettings(): Promise<AIAutomationConfig> {
    const configs = await prisma.config.findMany({
      where: {
        key: {
          in: [OPENROUTER_API_KEY, OPENROUTER_MODEL],
        },
      },
    });

    const configMap = new Map(configs.map((config) => [config.key, config.value]));

    return {
      openrouterApiKey: configMap.get(OPENROUTER_API_KEY) ?? null,
      openrouterModel: configMap.get(OPENROUTER_MODEL) ?? null,
    };
  }

  static async updateAIAutomationSettings(
    data: AIAutomationConfigData,
  ): Promise<AIAutomationConfig> {
    const operations = Object.entries({
      [OPENROUTER_API_KEY]: data.openrouterApiKey,
      [OPENROUTER_MODEL]: data.openrouterModel,
    })
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        const normalizedValue = value?.trim() ?? "";

        if (!normalizedValue) {
          return prisma.config.deleteMany({ where: { key } });
        }

        return prisma.config.upsert({
          where: { key },
          update: { value: normalizedValue },
          create: { key, value: normalizedValue },
        });
      });

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return this.getAIAutomationSettings();
  }
}
