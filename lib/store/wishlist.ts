import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  productIds: Set<string>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setWishlistItems: (productIds: string[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: new Set<string>(),

      addToWishlist: (productId) =>
        set((state) => {
          const newSet = new Set(state.productIds);
          newSet.add(productId);
          return { productIds: newSet };
        }),

      removeFromWishlist: (productId) =>
        set((state) => {
          const newSet = new Set(state.productIds);
          newSet.delete(productId);
          return { productIds: newSet };
        }),

      isInWishlist: (productId) => {
        const state = get();
        return state.productIds.has(productId);
      },

      setWishlistItems: (productIds) =>
        set({
          productIds: new Set(productIds),
        }),

      clearWishlist: () => set({ productIds: new Set() }),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Custom serialization for Set
      partialize: (state) => ({
        productIds: Array.from(state.productIds),
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        productIds: new Set(persistedState?.productIds || []),
      }),
    },
  ),
);
