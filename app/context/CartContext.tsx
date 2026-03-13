"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { Produto, ItemCarrinho } from "@/app/lib/types";

type CartState = {
  itens: ItemCarrinho[];
};

type CartAction =
  | { type: "ADICIONAR"; produto: Produto; quantidade?: number }
  | { type: "REMOVER"; produtoId: string }
  | { type: "ALTERAR_QUANTIDADE"; produtoId: string; quantidade: number }
  | { type: "LIMPAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADICIONAR": {
      const qtd = action.quantidade ?? 1;
      const existente = state.itens.find((i) => i.produto.id === action.produto.id);
      if (existente) {
        return {
          itens: state.itens.map((i) =>
            i.produto.id === action.produto.id
              ? { ...i, quantidade: i.quantidade + qtd }
              : i
          ),
        };
      }
      return {
        itens: [...state.itens, { produto: action.produto, quantidade: qtd }],
      };
    }
    case "REMOVER":
      return {
        itens: state.itens.filter((i) => i.produto.id !== action.produtoId),
      };
    case "ALTERAR_QUANTIDADE": {
      if (action.quantidade <= 0) {
        return { itens: state.itens.filter((i) => i.produto.id !== action.produtoId) };
      }
      return {
        itens: state.itens.map((i) =>
          i.produto.id === action.produtoId ? { ...i, quantidade: action.quantidade } : i
        ),
      };
    }
    case "LIMPAR":
      return { itens: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  itens: ItemCarrinho[];
  totalItens: number;
  totalPreco: number;
  adicionar: (produto: Produto, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
  quantidadeDoProduto: (produtoId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { itens: [] });

  const adicionar = useCallback((produto: Produto, quantidade = 1) => {
    dispatch({ type: "ADICIONAR", produto, quantidade });
  }, []);

  const remover = useCallback((produtoId: string) => {
    dispatch({ type: "REMOVER", produtoId });
  }, []);

  const alterarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    dispatch({ type: "ALTERAR_QUANTIDADE", produtoId, quantidade });
  }, []);

  const limpar = useCallback(() => {
    dispatch({ type: "LIMPAR" });
  }, []);

  const totalItens = state.itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalPreco = state.itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0);

  const quantidadeDoProduto = useCallback(
    (produtoId: string) => {
      const item = state.itens.find((i) => i.produto.id === produtoId);
      return item ? item.quantidade : 0;
    },
    [state.itens]
  );

  const value: CartContextValue = {
    itens: state.itens,
    totalItens,
    totalPreco,
    adicionar,
    remover,
    alterarQuantidade,
    limpar,
    quantidadeDoProduto,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
