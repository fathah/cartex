import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    key: string; // productId + variantId
    productId: string;
    variantId?: string;
    name: string;
    variantTitle?: string;
    price: number;
    quantity: number;
    minQuantity?: number;
    maxQuantity?: number | null;
    image?: string;
    slug: string;
    currencyCode?: string;
    marketCode?: string | null;
}

interface CartState {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (key: string) => void;
    updateQuantity: (key: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    clearForMarket: (marketCode?: string | null) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
             isOpen: false,
             openCart: () => set({ isOpen: true }),
             closeCart: () => set({ isOpen: false }),
             addToCart: (item) => set((state) => {
                const minQuantity = Math.max(1, item.minQuantity || 1);
                const requestedQuantity = Math.max(minQuantity, item.quantity);
                const maxQuantity =
                    item.maxQuantity === null || item.maxQuantity === undefined
                        ? null
                        : Math.max(minQuantity, item.maxQuantity);
                const existingItem = state.items.find((i) => i.key === item.key);
                if (existingItem) {
                    const nextQuantity = existingItem.quantity + requestedQuantity;
                    const clampedQuantity =
                        maxQuantity === null ? nextQuantity : Math.min(nextQuantity, maxQuantity);
                    return {
                        items: state.items.map((i) =>
                            i.key === item.key
                                ? {
                                    ...i,
                                    ...item,
                                    minQuantity,
                                    maxQuantity,
                                    quantity: clampedQuantity,
                                }
                                : i
                        ),
                    };
                }
                return {
                    items: [
                        ...state.items,
                        {
                            ...item,
                            minQuantity,
                            maxQuantity,
                            quantity:
                                maxQuantity === null
                                    ? requestedQuantity
                                    : Math.min(requestedQuantity, maxQuantity),
                        },
                    ],
                };
            }),
            removeFromCart: (key) => set((state) => ({
                items: state.items.filter((i) => i.key !== key),
            })),
            updateQuantity: (key, quantity) => set((state) => {
                 const existing = state.items.find((i) => i.key === key);
                 if (!existing) return state;

                 const minQuantity = Math.max(1, existing.minQuantity || 1);
                 const maxQuantity =
                    existing.maxQuantity === null || existing.maxQuantity === undefined
                        ? null
                        : Math.max(minQuantity, existing.maxQuantity);

                 if (quantity <= 0) {
                     return { items: state.items.filter((i) => i.key !== key) };
                 }

                 const clampedQuantity =
                    maxQuantity === null
                        ? Math.max(minQuantity, quantity)
                        : Math.min(Math.max(minQuantity, quantity), maxQuantity);
                 return {
                    items: state.items.map((i) =>
                        i.key === key ? { ...i, quantity: clampedQuantity } : i
                    ),
                };
            }),
            clearCart: () => set({ items: [] }),
            clearForMarket: (marketCode) => set((state) => {
                if (!marketCode) {
                    return state;
                }
                const hasMismatch = state.items.some((item) => item.marketCode && item.marketCode !== marketCode);
                return hasMismatch ? { items: [] } : state;
            }),
            getTotalItems: () => {
                const state = get();
                return state.items.reduce((acc, item) => acc + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true, // We will handle hydration manually if needed to avoid match errors, or use a wrapper
        }
    )
);
