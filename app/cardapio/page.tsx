"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  categorias,
  getProdutosPorCategoria,
  getSubcategorias,
} from "../lib/dados";
import { useCart } from "@/app/context/CartContext";

export default function CardapioPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<
    (typeof categorias)[number]["id"]
  >(categorias[1].id); // Começa com Alcool (como Cerveja na imagem)
  const [mostraEsquerda, setMostraEsquerda] = useState(false);
  const [mostraDireita, setMostraDireita] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);

  const produtosAtuais = getProdutosPorCategoria(categoriaAtiva);
  const subcategoriasAtuais = getSubcategorias(categoriaAtiva);
  const { adicionar, totalItens } = useCart();

  const atualizarSombras = () => {
    const el = tabsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setMostraEsquerda(scrollLeft > 8);
    setMostraDireita(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    atualizarSombras();
    el.addEventListener("scroll", atualizarSombras);
    const ro = new ResizeObserver(atualizarSombras);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", atualizarSombras);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Header Fixo */}
      <header className="sticky top-0 z-10 flex flex-col bg-background px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold opacity-90">DrinkBar </span>
        </div>

        {/* Tabs de Categoria - com hint de scroll */}
        <div className="relative -mx-4 px-4">
          {/* Gradientes laterais para indicar mais conteúdo */}
          {mostraDireita && (
            <div
              className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent"
              aria-hidden
            />
          )}
          {mostraEsquerda && (
            <div
              className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent"
              aria-hidden
            />
          )}

          <div
            ref={tabsRef}
            className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2 scroll-smooth snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categorias.map((cat) => {
              const isActive = categoriaAtiva === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  className={`flex shrink-0 flex-col items-center gap-1 snap-center transition-all py-1 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  <span className="whitespace-nowrap text-base">
                    {cat.label.split(" ")[0]}
                  </span>
                  {isActive && (
                    <div className="h-1 w-1 rounded-full bg-white mt-1"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint "deslize" só no mobile, some ao scrollar */}
          {mostraDireita && (
            <p className="text-center text-xs text-gray-500 mt-1.5 flex items-center justify-center gap-1">
              Deslize para ver mais
              <span className="inline-block animate-bounce-hint">→</span>
            </p>
          )}
        </div>
      </header>

      {/* Conteúdo Principal - Cartão Branco */}
      <main className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-20 mt-2 text-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {subcategoriasAtuais.length > 0 ? (
          subcategoriasAtuais.map((sub) => (
            <div key={sub} className="mb-8 last:mb-0">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{sub}</h2>
              <div className="flex flex-col gap-6">
                {produtosAtuais
                  .filter((p) => p.subcategoria === sub)
                  .map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between group"
                    >
                      <Link
                        href={`/produto/${produto.id}`}
                        className="flex items-center gap-4 flex-1"
                      >
                        <div className="relative h-16 w-10 shrink-0">
                          {/* Placeholder image logic since local images might not exist yet */}
                          <div className="absolute inset-0 bg-white rounded-md flex items-center justify-center text-xs text-gray-400">
                            <Image
                              src={produto.imagem}
                              alt={produto.nome}
                              fill
                              sizes="100px"
                              className="object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.parentElement!.classList.add(
                                  "bg-gray-200",
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">
                            {produto.nome}
                          </h3>
                          <span className="text-gray-500 font-medium text-sm mt-0.5">
                            R${produto.preco.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          adicionar(produto, 1);
                        }}
                        className="h-10 w-10 rounded-full border border-orange-300 text-orange-400 flex items-center justify-center hover:bg-orange-50 transition active:scale-95"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            Nenhum produto encontrado nesta categoria.
          </div>
        )}

        {/* Botão fixo do carrinho quando há itens */}
        {totalItens > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center">
            <Link
              href="/cardapio/carrinho"
              className="shrink-0 w-[60px] h-[60px] rounded-full bg-yellow-500 flex items-center justify-center text-black hover:bg-yellow-400 transition shadow-xl relative"
              aria-label="Ir para o carrinho"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                {totalItens > 99 ? "99+" : totalItens}
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
