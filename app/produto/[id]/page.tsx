"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getProdutoPorId } from "../../lib/dados";
import { useRouter } from "next/navigation";

export default function ProdutoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const produto = getProdutoPorId(resolvedParams.id);
  const [quantidade, setQuantidade] = useState(1);

  if (!produto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1b26] text-white">
        <p>Produto não encontrado</p>
        <button onClick={() => router.back()} className="ml-4 underline text-[#FFB74D]">Voltar</button>
      </div>
    );
  }

  const handleVoltar = () => {
    router.back();
  };

  const precoUnitario = produto.preco;
  const precoTotal = (precoUnitario * quantidade).toFixed(2).replace('.', ',');

  return (
    <div className="flex min-h-screen flex-col bg-[#1e1b26] font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 text-white z-10 relative">
        <button onClick={handleVoltar} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-lg font-medium capitalize">{produto.categoria}</h1>
        <div className="w-8"></div> {/* Spacer para centralizar */}
      </header>

      {/* Cartão Branco Principal */}
      <main className="flex-1 bg-white rounded-t-[40px] mt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative flex flex-col h-full overflow-hidden">
        
        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto pb-48">
          <div className="px-8 pt-8">
            
            {/* Tags Superiores */}
            <div className="flex justify-between items-start mb-8">
              {produto.teorAlcool ? (
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-900">
                  Alc. {produto.teorAlcool}
                </span>
              ) : <div />}
              
              {produto.volume && (
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-900">
                  {produto.volume}
                </span>
              )}
            </div>

            {/* Imagem do Produto */}
            <div className="relative w-full h-72 mb-8 flex items-center justify-center">
               <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={produto.imagem} 
                    alt={produto.nome}
                    className="max-h-full object-contain drop-shadow-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 font-bold text-xl">Imagem Indisponível</div>';
                    }}
                  />
               </div>
            </div>

            {/* Informações do Produto (Alinhado à Esquerda conforme imagem) */}
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {produto.nome}
              </h2>
              {produto.origem && (
                <p className="text-gray-500 text-sm mb-4">
                  {produto.origem}
                </p>
              )}
              {produto.descricao && (
                <p className="text-gray-900 text-base leading-relaxed font-medium mt-6">
                  {produto.descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Ação Inferior (Overlay) */}
        <div className="absolute bottom-10 left-6 right-6 z-20">
          <div className="bg-[#FFB74D] h-[72px] rounded-[36px] shadow-xl shadow-orange-200/50 flex items-center justify-between px-2 w-full">
            
            {/* Botão Menos */}
            <button 
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              className="h-14 w-16 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition text-gray-900"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            {/* Valor Central - Exatamente como na imagem: 3 x R$ 2.74 */}
            <div className="font-bold text-gray-900 text-xl flex items-center justify-center gap-1.5 w-full">
              <span>{quantidade}</span>
              <span className="text-gray-900/60 mx-1">×</span>
              <span>R${precoUnitario.toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Botão Mais */}
            <button 
              onClick={() => setQuantidade(quantidade + 1)}
              className="h-14 w-16 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition text-gray-900"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
