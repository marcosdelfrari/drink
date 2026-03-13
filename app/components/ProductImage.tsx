"use client";

import { useState } from "react";
import type { Produto } from "@/app/lib/types";

const PLACEHOLDER = "🍺";

export function ProductImage({
  produto,
  size = "md",
  className = "",
}: {
  produto: Produto;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [erro, setErro] = useState(false);
  const sizes = { sm: 48, md: 80, lg: 160 };
  const px = sizes[size];
  const showPlaceholder = !produto.imagem || erro;

  return (
    <div
      className={`img-placeholder overflow-hidden rounded-lg ${className}`}
      style={{ minWidth: px, minHeight: px, width: px, height: px }}
    >
      {!showPlaceholder ? (
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-full w-full object-contain object-center"
          onError={() => setErro(true)}
        />
      ) : (
        <span>{PLACEHOLDER}</span>
      )}
    </div>
  );
}
