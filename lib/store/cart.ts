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
                const existingItem = state.items.find((i) => i.key === item.key);
                if (existingItem) {
                    return {
                        items: state.items.map((i) =>
                            i.key === item.key
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    };
                }
                return { items: [...state.items, item] };
            }),
            removeFromCart: (key) => set((state) => ({
                items: state.items.filter((i) => i.key !== key),
            })),
            updateQuantity: (key, quantity) => set((state) => {
                 if (quantity <= 0) {
                     return { items: state.items.filter((i) => i.key !== key) };
                 }
                 return {
                    items: state.items.map((i) =>
                        i.key === key ? { ...i, quantity } : i
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
