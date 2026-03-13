export type Categoria = "refrigerante" | "alcool" | "salgadinho" | "tabacaria";

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  categoria: Categoria;
  subcategoria?: string;
  volume?: string;
  teorAlcool?: string;
  origem?: string;
  descricao?: string;
  avaliacao?: number;
  review?: string;
  autorReview?: string;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export type TipoEntrega = "entrega" | "retirada";

export type FormaPagamento =
  | "pix"
  | "dinheiro"
  | "credito"
  | "debito";

export interface DadosCheckout {
  nome: string;
  whatsapp: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  tipoEntrega: TipoEntrega;
  formaPagamento: FormaPagamento;
  trocoPara?: string; // só quando formaPagamento === "dinheiro"
}
