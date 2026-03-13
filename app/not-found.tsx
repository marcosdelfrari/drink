import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <h1 className="text-4xl font-bold opacity-90">404</h1>
      <p className="mt-2 text-gray-400">Página não encontrada.</p>
      <Link
        href="/cardapio"
        className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        Ir para o cardápio
      </Link>
    </div>
  );
}
