"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export function CartButton() {
  const { totalItens } = useCart();

  return (
    <Link
      href="/cardapio/carrinho"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      aria-label="Ver carrinho"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {totalItens > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-bold">
          {totalItens > 99 ? "99+" : totalItens}
        </span>
      )}
    </Link>
  );
}
