"use server";

import CollectionDB from "@/db/collection";

export async function getCollections() {
  return await CollectionDB.list();
}
