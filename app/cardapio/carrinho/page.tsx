"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { ProductImage } from "@/app/components/ProductImage";
import { buscarCep } from "@/app/lib/cep";
import { calcularValorEntrega, VALOR_FRETE } from "@/app/lib/frete";
import { gerarNumeroPedido, salvarNumeroPedidoNoCookie } from "@/app/lib/pedido";
import type { DadosCheckout, FormaPagamento, TipoEntrega } from "@/app/lib/types";

const initialForm: DadosCheckout = {
  nome: "",
  whatsapp: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  tipoEntrega: "entrega",
  formaPagamento: "pix",
  trocoPara: "",
};

export default function CarrinhoPage() {
  const router = useRouter();
  const { itens, totalItens, totalPreco, alterarQuantidade, remover, limpar } = useCart();
  const [step, setStep] = useState<"carrinho" | "checkout">("carrinho");
  const [form, setForm] = useState<DadosCheckout>(initialForm);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const updateForm = useCallback((field: keyof DadosCheckout, value: string | TipoEntrega | FormaPagamento) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "cep") setCepError(null);
  }, []);

  const handleCepBlur = useCallback(async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const endereco = await buscarCep(form.cep);
      if (endereco) {
        setForm((prev) => ({
          ...prev,
          rua: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          uf: endereco.uf,
        }));
      } else {
        setCepError("CEP não encontrado.");
      }
    } catch {
      setCepError("Erro ao buscar CEP. Tente de novo.");
    } finally {
      setCepLoading(false);
    }
  }, [form.cep]);

  const valorFrete = calcularValorEntrega(form.tipoEntrega);
  const totalGeral = totalPreco + valorFrete;

  const canSubmit =
    form.nome.trim() &&
    form.whatsapp.replace(/\D/g, "").length >= 10 &&
    form.cep.replace(/\D/g, "").length === 8 &&
    form.rua.trim() &&
    form.numero.trim() &&
    form.bairro.trim() &&
    form.cidade.trim() &&
    form.uf.trim() &&
    (form.formaPagamento !== "dinheiro" || (form.trocoPara && parseFloat(form.trocoPara.replace(",", ".")) >= totalGeral));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const numeroPedido = gerarNumeroPedido();
    salvarNumeroPedidoNoCookie(numeroPedido);
    // Aqui você pode enviar o pedido para API/WhatsApp etc.
    const msg = [
      `*Novo pedido* - ${numeroPedido}`,
      `Nome: ${form.nome}`,
      `WhatsApp: ${form.whatsapp}`,
      form.tipoEntrega === "entrega"
        ? `Endereço: ${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""} - ${form.bairro}, ${form.cidade}/${form.uf} - CEP ${form.cep}`
        : "Retirada no local",
      `Pagamento: ${form.formaPagamento === "pix" ? "PIX" : form.formaPagamento === "dinheiro" ? `Dinheiro (troco para R$ ${form.trocoPara})` : form.formaPagamento === "credito" ? "Crédito" : "Débito"}`,
      `Total: R$ ${totalGeral.toFixed(2).replace(".", ",")}`,
    ].join("\n");
    console.log(msg);
    limpar();
    setForm(initialForm);
    setStep("carrinho");
    router.push(`/cardapio/carrinho/sucesso?numero=${encodeURIComponent(numeroPedido)}`);
  };

  const handleVoltar = () => {
    if (step === "checkout") {
      setStep("carrinho");
    } else {
      router.push("/cardapio");
    }
  };

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
        <h1 className="text-lg font-medium">{step === "carrinho" ? "Carrinho" : "Finalizar Pedido"}</h1>
        <div className="w-8"></div> {/* Spacer para centralizar */}
      </header>

      {/* Cartão Branco Principal */}
      <main className="flex-1 bg-white rounded-t-[40px] mt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-20">
          
          {itens.length === 0 && step === "carrinho" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="mb-6 text-gray-500 font-medium">Seu carrinho está vazio.</p>
              <Link
                href="/cardapio"
                className="bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition shadow-lg"
              >
                Ver cardápio
              </Link>
            </div>
          ) : step === "carrinho" ? (
            <>
              <div className="space-y-6">
                {itens.map((item) => (
                  <div
                    key={item.produto.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-6 last:border-0"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <ProductImage produto={item.produto} size="sm" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate text-base">{item.produto.nome}</p>
                      <p className="text-sm font-medium text-gray-500 mt-1">
                        R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantidade <= 1) remover(item.produto.id);
                          else alterarQuantidade(item.produto.id, item.quantidade - 1);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:scale-105 transition"
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-semibold text-gray-900 text-sm">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-black shadow-sm hover:scale-105 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                <div className="flex justify-between text-base mb-2">
                  <span className="text-gray-500">
                    {totalItens} {totalItens === 1 ? "item" : "itens"}
                  </span>
                  <span className="font-bold text-gray-900">R$ {totalPreco.toFixed(2).replace(".", ",")}</span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">Frete será calculado na próxima etapa</p>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="w-full bg-yellow-500 text-black h-[60px] rounded-[30px] font-semibold text-lg hover:bg-yellow-400 transition shadow-xl flex items-center justify-center"
                >
                  Finalizar pedido
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Dados para contato</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 ml-1">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={form.nome}
                      onChange={(e) => updateForm("nome", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 ml-1">WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={form.whatsapp}
                      onChange={(e) => updateForm("whatsapp", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Endereço</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-700 ml-1">CEP</label>
                      <input
                        type="text"
                        placeholder="00000-000"
                        value={form.cep}
                        onChange={(e) => updateForm("cep", e.target.value)}
                        onBlur={handleCepBlur}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                        required
                      />
                    </div>
                    {cepLoading && (
                      <div className="flex items-center pt-6">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {cepError && <p className="text-sm text-red-500 font-medium ml-1">{cepError}</p>}
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 ml-1">Rua</label>
                    <input
                      type="text"
                      placeholder="Nome da rua"
                      value={form.rua}
                      onChange={(e) => updateForm("rua", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 ml-1">Número</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={form.numero}
                        onChange={(e) => updateForm("numero", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 ml-1">Comp.</label>
                      <input
                        type="text"
                        placeholder="Apto 101"
                        value={form.complemento ?? ""}
                        onChange={(e) => updateForm("complemento", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 ml-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Nome do bairro"
                      value={form.bairro}
                      onChange={(e) => updateForm("bairro", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-gray-700 ml-1">Cidade</label>
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={form.cidade}
                        onChange={(e) => updateForm("cidade", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 ml-1">UF</label>
                      <input
                        type="text"
                        placeholder="UF"
                        value={form.uf}
                        onChange={(e) => updateForm("uf", e.target.value.toUpperCase().slice(0, 2))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Entrega</h2>
                <div className="flex gap-3">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 py-3 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      checked={form.tipoEntrega === "entrega"}
                      onChange={() => updateForm("tipoEntrega", "entrega")}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900">Entrega</span>
                    <span className="text-sm text-gray-500">R$ {VALOR_FRETE.toFixed(2).replace(".", ",")}</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 py-3 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      checked={form.tipoEntrega === "retirada"}
                      onChange={() => updateForm("tipoEntrega", "retirada")}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900">Retirada</span>
                    <span className="text-sm text-gray-500">Grátis</span>
                  </label>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Pagamento</h2>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="pagamento"
                      checked={form.formaPagamento === "pix"}
                      onChange={() => updateForm("formaPagamento", "pix")}
                      className="h-5 w-5 accent-yellow-500"
                    />
                    <span className="text-gray-900 font-medium">PIX</span>
                  </label>
                  
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="pagamento"
                      checked={form.formaPagamento === "dinheiro"}
                      onChange={() => updateForm("formaPagamento", "dinheiro")}
                      className="h-5 w-5 accent-yellow-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">Dinheiro</span>
                      <span className="text-xs text-gray-500">Pagamento na entrega</span>
                    </div>
                  </label>
                  
                  {form.formaPagamento === "dinheiro" && (
                    <div className="ml-8 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Precisa de troco para quanto?"
                        value={form.trocoPara ?? ""}
                        onChange={(e) => updateForm("trocoPara", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="pagamento"
                      checked={form.formaPagamento === "credito"}
                      onChange={() => updateForm("formaPagamento", "credito")}
                      className="h-5 w-5 accent-yellow-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">Cartão de Crédito</span>
                      <span className="text-xs text-gray-500">Pagamento na entrega</span>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50 transition">
                    <input
                      type="radio"
                      name="pagamento"
                      checked={form.formaPagamento === "debito"}
                      onChange={() => updateForm("formaPagamento", "debito")}
                      className="h-5 w-5 accent-yellow-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">Cartão de Débito</span>
                      <span className="text-xs text-gray-500">Pagamento na entrega</span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>R$ {totalPreco.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>{form.tipoEntrega === "entrega" ? "Frete" : "Retirada"}</span>
                  <span>
                    {valorFrete === 0 ? "Grátis" : `R$ ${valorFrete.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>R$ {totalGeral.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-yellow-500 text-black h-[60px] rounded-[30px] font-semibold text-lg hover:bg-yellow-400 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Confirmar pedido
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
