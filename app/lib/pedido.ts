const COOKIE_NUMERO_PEDIDO = "drink_numero_pedido";
const COOKIE_MAX_AGE_DAYS = 7;

export function gerarNumeroPedido(): string {
  const parte = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `DRINK-${parte}${random}`;
}

export function salvarNumeroPedidoNoCookie(numero: string): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NUMERO_PEDIDO}=${encodeURIComponent(numero)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function lerNumeroPedidoDoCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + COOKIE_NUMERO_PEDIDO.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return value || null;
}
