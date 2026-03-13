"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  produtos,
  categorias,
  getProdutosPorCategoria,
  getSubcategorias,
} from "@/app/lib/dados";
import { ProductCard } from "@/app/components/ProductCard";
import { CartButton } from "@/app/components/CartButton";
export default function CardapioPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("refrigerante");
  const [busca, setBusca] = useState("");

  const listaFiltrada = useMemo(() => {
    let lista = getProdutosPorCategoria(categoriaAtiva);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.subcategoria?.toLowerCase().includes(q) ||
          p.origem?.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [categoriaAtiva, busca]);

  const subcategorias = useMemo(
    () => getSubcategorias(categoriaAtiva),
    [categoriaAtiva]
  );

  const porSubcategoria = useMemo(() => {
    const map = new Map<string, typeof listaFiltrada>();
    for (const p of listaFiltrada) {
      const sub = p.subcategoria ?? "Outros";
      if (!map.has(sub)) map.set(sub, []);
      map.get(sub)!.push(p);
    }
    return map;
  }, [listaFiltrada]);

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0a14]/95 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white"
          aria-label="Voltar"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <p className="text-sm text-white/80">
          Encontramos {produtos.length} bebidas
        </p>
        <CartButton />
      </header>

      <div className="flex gap-4 overflow-x-auto border-b border-white/10 px-4 py-3 scrollbar-hide">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoriaAtiva(cat.id)}
            className={`shrink-0 border-b-2 pb-1 text-sm font-medium transition ${
              categoriaAtiva === cat.id
                ? "border-[#7c3aed] text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-3">
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            🔍
          </span>
          <input
            type="search"
            placeholder="Buscar bebidas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-white/40 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        <div className="rounded-2xl bg-white p-4 text-gray-900">
          {listaFiltrada.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Nenhuma bebida encontrada.
            </p>
          ) : (
            <div className="space-y-6">
              {Array.from(porSubcategoria.entries()).map(([sub, itens]) => (
                <section key={sub}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {sub}
                  </h2>
                  <ul className="space-y-2">
                    {itens.map((produto) => (
                      <li key={produto.id}>
                        <ProductCard produto={produto} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/10 bg-[#0f0a14] px-4 py-3">
        <Link
          href="/cardapio"
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs">Cardápio</span>
        </Link>
        <Link
          href="/cardapio/carrinho"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg transition hover:bg-[#6d28d9]"
          aria-label="Carrinho"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </Link>
      </nav>
      <div className="h-20" />
    </div>
  );
}
