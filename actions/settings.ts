'use server';

import SettingsDB, { UpdateSettingsData } from '@/db/settings';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  return await SettingsDB.get();
}

export async function updateSettings(data: UpdateSettingsData) {
  const settings = await SettingsDB.update(data);
  revalidatePath('/admin/settings');
  revalidatePath('/'); // Revalidate storefront too as it might use store name/logo
  return settings;
}
