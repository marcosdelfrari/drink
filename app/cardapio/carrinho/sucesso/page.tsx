"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { salvarNumeroPedidoNoCookie, lerNumeroPedidoDoCookie } from "@/app/lib/pedido";

const TEMPO_MEDIO_MIN = 30;
const TEMPO_MEDIO_MAX = 45;

function SucessoContent() {
  const searchParams = useSearchParams();
  const [numeroPedido, setNumeroPedido] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("numero");
    if (fromUrl) {
      setNumeroPedido(fromUrl);
      salvarNumeroPedidoNoCookie(fromUrl);
    } else {
      setNumeroPedido(lerNumeroPedidoDoCookie());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-white/10 bg-[#0f0a14]/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold">Pedido realizado</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Obrigado pelo seu pedido!</h2>
        <p className="text-white/80 mb-8 max-w-sm">
          Seu pedido foi recebido e em breve entraremos em contato.
        </p>

        {numeroPedido && (
          <div className="rounded-2xl bg-white/10 border border-white/20 px-6 py-4 mb-8">
            <p className="text-sm text-white/60 uppercase tracking-wide mb-1">Número do pedido</p>
            <p className="text-xl font-mono font-bold text-[#a78bfa]">{numeroPedido}</p>
          </div>
        )}

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-left max-w-sm w-full space-y-4 mb-10">
          <p className="text-white/90 font-medium">
            ⏱️ Tempo médio de entrega:{" "}
            <span className="text-[#a78bfa] font-semibold">
              {TEMPO_MEDIO_MIN} a {TEMPO_MEDIO_MAX} minutos
            </span>
          </p>
          <p className="text-white/80 text-sm">
            Entraremos em contato pelo WhatsApp caso precisemos de alguma confirmação.
          </p>
          <p className="text-white/80 text-sm">
            O status do seu pedido será enviado pelo WhatsApp (preparando, saiu para entrega, etc.).
          </p>
        </div>

        <Link
          href="/cardapio"
          className="rounded-xl bg-[#7c3aed] px-8 py-3.5 font-medium text-white hover:bg-[#6d28d9] transition"
        >
          Voltar ao cardápio
        </Link>
      </main>
    </div>
  );
}

function SucessoFallback() {
  return (
    <div className="min-h-screen bg-[#0f0a14] text-white flex flex-col items-center justify-center">
      <div className="animate-pulse text-white/60">Carregando...</div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<SucessoFallback />}>
      <SucessoContent />
    </Suspense>
  );
}
