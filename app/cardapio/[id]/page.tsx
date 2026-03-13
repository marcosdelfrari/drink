"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { getProdutoPorId } from "@/app/lib/dados";
import { ProductImage } from "@/app/components/ProductImage";
import { CartButton } from "@/app/components/CartButton";

function Estrelas({ nota }: { nota: number }) {
  const cheias = Math.floor(nota);
  const meia = nota % 1 >= 0.5;
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>
          {i <= cheias ? "★" : i === cheias + 1 && meia ? "½" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-500">{nota.toFixed(1)}</span>
    </div>
  );
}

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const produto = id ? getProdutoPorId(id) : undefined;
  const { adicionar, remover, quantidadeDoProduto, alterarQuantidade } = useCart();

  if (!produto) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0a14] text-white">
        <p className="mb-4">Produto não encontrado.</p>
        <Link
          href="/cardapio"
          className="rounded-xl bg-[#7c3aed] px-4 py-2 font-medium hover:bg-[#6d28d9]"
        >
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const qtd = quantidadeDoProduto(produto.id);

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0a14]/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
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
        </button>
        <span className="text-sm font-medium capitalize">{produto.categoria}</span>
        <CartButton />
      </header>

      <main className="px-4 py-6">
        <div className="rounded-2xl bg-white p-5 text-gray-900 shadow-lg">
          <div className="mb-4 flex items-start gap-2 text-sm text-gray-500">
            {produto.teorAlcool && <span>Alc. {produto.teorAlcool}</span>}
            {produto.volume && <span>• {produto.volume}</span>}
          </div>

          <div className="mb-6 flex justify-center">
            <ProductImage produto={produto} size="lg" />
          </div>

          <h1 className="mb-1 text-xl font-bold">{produto.nome}</h1>
          {produto.origem && (
            <p className="mb-4 text-sm text-gray-500">{produto.origem}</p>
          )}

          {produto.avaliacao != null && (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                {produto.autorReview?.[0] ?? "?"}
              </div>
              <div>
                <Estrelas nota={produto.avaliacao} />
                {produto.review && (
                  <p className="mt-1 max-w-md text-sm text-gray-600 line-clamp-2">
                    {produto.review}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (qtd <= 1) remover(produto.id);
                  else alterarQuantidade(produto.id, qtd - 1);
                }}
                disabled={qtd === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-16 text-center font-semibold">
                {qtd} × R$ {produto.preco.toFixed(2).replace(".", ",")}
              </span>
              <button
                type="button"
                onClick={() => alterarQuantidade(produto.id, qtd + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed] text-white transition hover:bg-[#6d28d9]"
              >
                +
              </button>
            </div>
            {qtd === 0 && (
              <button
                type="button"
                onClick={() => adicionar(produto)}
                className="rounded-full bg-[#7c3aed] px-5 py-2.5 font-medium text-white hover:bg-[#6d28d9]"
              >
                Adicionar
              </button>
            )}
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-center border-t border-white/10 bg-[#0f0a14] px-4 py-3">
        <Link
          href="/cardapio/carrinho"
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[#7c3aed] py-3 font-medium text-white shadow-lg transition hover:bg-[#6d28d9]"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ir para o carrinho
        </Link>
      </nav>
      <div className="h-20" />
    </div>
  );
}
