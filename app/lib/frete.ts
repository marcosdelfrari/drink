import type { TipoEntrega } from "./types";

/** Valor fixo do frete para entrega (em reais). Ajuste conforme sua região. */
export const VALOR_FRETE = 8;

export function calcularValorEntrega(tipo: TipoEntrega): number {
  return tipo === "retirada" ? 0 : VALOR_FRETE;
}
