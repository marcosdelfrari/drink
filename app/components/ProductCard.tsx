"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { ProductImage } from "./ProductImage";
import type { Produto } from "@/app/lib/types";

export function ProductCard({ produto }: { produto: Produto }) {
  const { adicionar } = useCart();

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
      <ProductImage produto={produto} size="sm" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/cardapio/${produto.id}`}
          className="block truncate font-medium text-gray-900 hover:underline"
        >
          {produto.nome}
        </Link>
        <p className="text-sm font-semibold text-[#7c3aed]">
          R$ {produto.preco.toFixed(2).replace(".", ",")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => adicionar(produto)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white transition hover:bg-[#6d28d9]"
        aria-label={`Adicionar ${produto.nome} ao carrinho`}
      >
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}
