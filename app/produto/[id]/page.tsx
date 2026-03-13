"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProdutoPorId } from "../../lib/dados";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function ProdutoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { adicionar, quantidadeDoProduto, totalItens } = useCart();
  const produto = getProdutoPorId(resolvedParams.id);
  const [quantidade, setQuantidade] = useState(1);
  const [imgError, setImgError] = useState(false);

  const noCarrinho = produto ? quantidadeDoProduto(produto.id) > 0 : false;

  if (!produto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1b26] text-white">
        <p>Produto não encontrado</p>
        <button
          onClick={() => router.back()}
          className="ml-4 underline text-[#FFB74D]"
        >
          Voltar
        </button>
      </div>
    );
  }

  const handleVoltar = () => {
    router.back();
  };

  const handleAdicionarCarrinho = () => {
    if (!produto) return;
    adicionar(produto, quantidade);
  };

  const precoUnitario = produto.preco;
  const precoTotal = (precoUnitario * quantidade).toFixed(2).replace(".", ",");

  return (
    <div className="flex min-h-screen flex-col bg-[#1e1b26] font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 text-white z-10 relative">
        <button
          onClick={handleVoltar}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition"
        >
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
        <h1 className="text-lg font-medium capitalize">{produto.categoria}</h1>
        <div className="w-8"></div> {/* Spacer para centralizar */}
      </header>

      {/* Cartão Branco Principal */}
      <main className="flex-1 bg-white rounded-t-xl mt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative flex flex-col h-full overflow-hidden">
        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto pb-28">
          <div className="px-8 pt-8">
            {/* Tags Superiores - Mantendo, mas ajustando espaçamento se necessário */}
            <div className="flex justify-between items-start mb-4">
              {produto.teorAlcool ? (
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-900">
                  Alc. {produto.teorAlcool}
                </span>
              ) : (
                <div />
              )}

              {produto.volume && (
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-900">
                  {produto.volume}
                </span>
              )}
            </div>

            {/* Imagem do Produto */}
            <div className="relative w-full h-64 mb-6 flex items-center justify-center">
              {imgError ? (
                <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 font-bold text-xl">
                  Imagem Indisponível
                </div>
              ) : (
                <Image
                  src={produto.imagem}
                  alt={produto.nome}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-contain"
                  onError={() => setImgError(true)}
                />
              )}
            </div>

            {/* Seção de Detalhes (Fiel ao Design) */}
            <div className="flex flex-col">
              {/* Título e Coração */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-medium text-gray-900 leading-tight">
                  {produto.nome}
                </h2>
              </div>

              {/* Quantidade e Preço */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 text-gray-900 text-xl font-medium hover:bg-gray-50 transition"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-6 text-center">
                    {quantidade}
                  </span>
                  <button
                    onClick={() => setQuantidade(quantidade + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 text-gray-900 text-xl font-medium hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>

                <div className="text-2xl font-bold text-gray-900">
                  R$ {precoTotal}
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <p className="text-gray-600 text-base leading-relaxed">
                  {produto.descricao}{" "}
                  {produto.origem &&
                    `Originário de ${produto.origem}, este produto é selecionado para garantir a melhor experiência.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Fixo de Comprar + Bolinha do Carrinho */}
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-3">
          <button
            onClick={handleAdicionarCarrinho}
            className={`bg-yellow-500/80 backdrop-blur-xl text-black h-[60px] rounded-[30px] font-light text-lg hover:bg-yellow-500/90 transition shadow-xl flex items-center justify-center border border-white/10 ${noCarrinho ? "flex-1" : "w-full"}`}
          >
            Adicionar ao carrinho
          </button>
          {noCarrinho && (
            <Link
              href="/cardapio/carrinho"
              className="shrink-0 w-[60px] h-[60px] rounded-full bg-yellow-500/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-black hover:bg-yellow-500/90 transition shadow-xl relative"
              aria-label="Ir para o carrinho"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItens > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-xs font-bold">
                  {totalItens > 99 ? "99+" : totalItens}
                </span>
              )}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
