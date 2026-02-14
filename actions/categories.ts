'use server';

import CollectionDB from '@/db/collection';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return await CollectionDB.list();
}

export async function createCategory(data: any) {
  try {
    const category = await CollectionDB.create(
      data.name,
      data.slug,
      data.description,
      data.imageId
    );
    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    const category = await CollectionDB.update(id, data);
    revalidatePath('/admin/categories');
    return { success: true, category };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await CollectionDB.delete(id);
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
