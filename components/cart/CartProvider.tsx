"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLicense = {
  licenseId: string;
  beatId: string;
  beatTitle: string;
  beatCoverUrl: string | null;
  licenseName: string;
  audioFormat: string;
  price: number;
  exclusive: boolean;
};

type CartContextValue = {
  removeBeat: (beatId: string) => void;
  items: CartLicense[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartLicense) => void;
  removeItem: (licenseId: string) => void;
  clearCart: () => void;
  containsLicense: (licenseId: string) => boolean;
};

type CartProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "ktb-cart";

const CartContext =
  createContext<CartContextValue | null>(null);

export default function CartProvider({
  children,
}: CartProviderProps) {
  const [items, setItems] = useState<CartLicense[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart =
        window.localStorage.getItem(STORAGE_KEY);

      if (storedCart) {
        const parsedCart =
          JSON.parse(storedCart) as CartLicense[];

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "No se pudo cargar el carrito:",
        error,
      );
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el carrito:",
        error,
      );
    }
  }, [items, isHydrated]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen((currentValue) => !currentValue);
  }, []);

  const addItem = useCallback(
    (newItem: CartLicense) => {
      setItems((currentItems) => {
        const itemsWithoutSameBeat =
          currentItems.filter(
            (item) => item.beatId !== newItem.beatId,
          );

        return [
          ...itemsWithoutSameBeat,
          newItem,
        ];
      });

      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback(
    (licenseId: string) => {
      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.licenseId !== licenseId,
        ),
      );
    },
    [],
  );
  const removeBeat = useCallback(
  (beatId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.beatId !== beatId,
      ),
    );
  },
  [],
);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const containsLicense = useCallback(
    (licenseId: string) =>
      items.some(
        (item) =>
          item.licenseId === licenseId,
      ),
    [items],
  );

  const itemCount = items.length;

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0),
        0,
      ),
    [items],
  );

  const value = useMemo<CartContextValue>(
  () => ({
    items,
    itemCount,
    total,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    removeBeat,
    clearCart,
    containsLicense,
  }),
  [
    items,
    itemCount,
    total,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    removeBeat,
    clearCart,
    containsLicense,
  ],
);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider.",
    );
  }

  return context;
}