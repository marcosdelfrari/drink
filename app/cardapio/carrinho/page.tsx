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

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0a14]/95 px-4 py-3 backdrop-blur">
        {step === "checkout" ? (
          <button
            type="button"
            onClick={() => setStep("carrinho")}
            className="flex items-center gap-2 text-white/80 hover:text-white"
            aria-label="Voltar ao carrinho"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <Link
            href="/cardapio"
            className="flex items-center gap-2 text-white/80 hover:text-white"
            aria-label="Voltar ao cardápio"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <h1 className="text-lg font-semibold">{step === "carrinho" ? "Carrinho" : "Finalizar pedido"}</h1>
        <div className="w-10" />
      </header>

      <main className="px-4 py-6">
        {itens.length === 0 && step === "carrinho" ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 py-16 text-center">
            <p className="mb-4 text-white/80">Seu carrinho está vazio.</p>
            <Link
              href="/cardapio"
              className="rounded-xl bg-[#7c3aed] px-6 py-2.5 font-medium text-white hover:bg-[#6d28d9]"
            >
              Ver cardápio
            </Link>
          </div>
        ) : step === "carrinho" ? (
          <>
            <div className="space-y-3">
              {itens.map((item) => (
                <div
                  key={item.produto.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 text-gray-900"
                >
                  <ProductImage produto={item.produto} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{item.produto.nome}</p>
                    <p className="text-sm font-semibold text-[#7c3aed]">
                      R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantidade <= 1) remover(item.produto.id);
                        else alterarQuantidade(item.produto.id, item.quantidade - 1);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center font-medium">{item.quantidade}</span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-white/10 p-4">
              <div className="flex justify-between text-lg">
                <span className="text-white/80">
                  {totalItens} {totalItens === 1 ? "item" : "itens"}
                </span>
                <span className="font-bold">R$ {totalPreco.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("checkout")}
              className="mt-6 w-full rounded-xl bg-[#7c3aed] py-3.5 font-medium text-white hover:bg-[#6d28d9]"
            >
              Finalizar pedido
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl bg-white/10 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Dados para contato</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={(e) => updateForm("nome", e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  required
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (com DDD)"
                  value={form.whatsapp}
                  onChange={(e) => updateForm("whatsapp", e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  required
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white/10 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Endereço</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CEP"
                    value={form.cep}
                    onChange={(e) => updateForm("cep", e.target.value)}
                    onBlur={handleCepBlur}
                    className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                    required
                  />
                  {cepLoading && (
                    <span className="flex items-center text-sm text-white/60">Buscando...</span>
                  )}
                </div>
                {cepError && <p className="text-sm text-red-400">{cepError}</p>}
                <input
                  type="text"
                  placeholder="Rua"
                  value={form.rua}
                  onChange={(e) => updateForm("rua", e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Número"
                    value={form.numero}
                    onChange={(e) => updateForm("numero", e.target.value)}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Complemento (opcional)"
                    value={form.complemento ?? ""}
                    onChange={(e) => updateForm("complemento", e.target.value)}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={form.bairro}
                  onChange={(e) => updateForm("bairro", e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={form.cidade}
                    onChange={(e) => updateForm("cidade", e.target.value)}
                    className="col-span-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="UF"
                    value={form.uf}
                    onChange={(e) => updateForm("uf", e.target.value.toUpperCase().slice(0, 2))}
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white/10 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Entrega</h2>
              <div className="flex gap-3">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="tipoEntrega"
                    checked={form.tipoEntrega === "entrega"}
                    onChange={() => updateForm("tipoEntrega", "entrega")}
                    className="sr-only"
                  />
                  <span>Entrega</span>
                  <span className="text-sm text-white/80">R$ {VALOR_FRETE.toFixed(2).replace(".", ",")}</span>
                </label>
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="tipoEntrega"
                    checked={form.tipoEntrega === "retirada"}
                    onChange={() => updateForm("tipoEntrega", "retirada")}
                    className="sr-only"
                  />
                  <span>Retirada</span>
                  <span className="text-sm text-white/80">R$ 0,00</span>
                </label>
              </div>
              <p className="mt-2 text-center text-sm text-white/60">
                {form.tipoEntrega === "entrega"
                  ? `Frete: R$ ${VALOR_FRETE.toFixed(2).replace(".", ",")}`
                  : "Retirada no local — sem custo"}
              </p>
            </section>

            <section className="rounded-2xl bg-white/10 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Forma de pagamento</h2>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="pagamento"
                    checked={form.formaPagamento === "pix"}
                    onChange={() => updateForm("formaPagamento", "pix")}
                    className="h-4 w-4 accent-[#7c3aed]"
                  />
                  <span>PIX</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="pagamento"
                    checked={form.formaPagamento === "dinheiro"}
                    onChange={() => updateForm("formaPagamento", "dinheiro")}
                    className="h-4 w-4 accent-[#7c3aed]"
                  />
                  <span>Na entrega — Dinheiro</span>
                </label>
                {form.formaPagamento === "dinheiro" && (
                  <div className="ml-7">
                    <input
                      type="text"
                      placeholder="Troco para (ex: 50,00)"
                      value={form.trocoPara ?? ""}
                      onChange={(e) => updateForm("trocoPara", e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-[#7c3aed] focus:outline-none"
                    />
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="pagamento"
                    checked={form.formaPagamento === "credito"}
                    onChange={() => updateForm("formaPagamento", "credito")}
                    className="h-4 w-4 accent-[#7c3aed]"
                  />
                  <span>Na entrega — Crédito</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 has-[:checked]:border-[#7c3aed] has-[:checked]:bg-[#7c3aed]/20">
                  <input
                    type="radio"
                    name="pagamento"
                    checked={form.formaPagamento === "debito"}
                    onChange={() => updateForm("formaPagamento", "debito")}
                    className="h-4 w-4 accent-[#7c3aed]"
                  />
                  <span>Na entrega — Débito</span>
                </label>
              </div>
            </section>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal ({totalItens} itens)</span>
                  <span>R$ {totalPreco.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>{form.tipoEntrega === "entrega" ? "Frete" : "Retirada"}</span>
                  <span>R$ {valorFrete.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {totalGeral.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#7c3aed] py-3.5 font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar pedido
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
