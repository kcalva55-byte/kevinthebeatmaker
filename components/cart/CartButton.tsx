"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "./CartProvider";

export default function CartButton() {
  const {
    itemCount,
    openCart,
  } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Abrir carrito"
      className="fixed bottom-6 right-6 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition hover:scale-105 hover:bg-blue-500 active:scale-95"
    >
      <ShoppingBag size={26} />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-black">
          {itemCount}
        </span>
      )}
    </button>
  );
}