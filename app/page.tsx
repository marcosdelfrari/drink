"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  categorias,
  getProdutosPorCategoria,
  getSubcategorias,
  produtos,
} from "./lib/dados";

export default function Home() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<(typeof categorias)[number]["id"]>(categorias[1].id); // Começa com Alcool (como Cerveja na imagem)

  const produtosAtuais = getProdutosPorCategoria(categoriaAtiva);
  const subcategoriasAtuais = getSubcategorias(categoriaAtiva);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Header Fixo */}
      <header className="sticky top-0 z-10 flex flex-col bg-background px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm font-medium opacity-90">
            Encontramos{" "}
            <span className="font-bold text-white">{produtos.length}</span>{" "}
            bebidas
          </span>

          <button className="p-2 -mr-2 rounded-full hover:bg-white/10 transition">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>

        {/* Tabs de Categoria */}
        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide pb-2">
          {categorias.map((cat) => {
            const isActive = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
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

                      <button className="h-10 w-10 rounded-full border border-orange-300 text-orange-400 flex items-center justify-center hover:bg-orange-50 transition active:scale-95">
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
      </main>
    </div>
  );
}
