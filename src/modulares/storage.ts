import type { Transaction } from "./types.js";

const KEY: string = "transactions_v1";

function normalizarTransacao(t: unknown): Transaction {
  if (typeof t !== "object" || t === null) {
    return {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      descricao: "",
      valor: 0,
      tipo: "receita",
      categoria: "Outros",
      data: "",
    };
  }

  const obj: Record<string, unknown> = t as Record<string, unknown>;

  return {
    id: String(obj.id ?? `${Date.now()}-${Math.floor(Math.random() * 100000)}`),
    descricao: String(obj.descricao ?? ""),
    valor: Number(obj.valor) || 0,
    tipo: (obj.tipo as Transaction["tipo"]) ?? "receita",
    categoria: String(obj.categoria ?? "Outros"),
    data: String(obj.data ?? obj.date ?? ""),
  };
}

export function carregarTransacoes(): Transaction[] {
  const raw: string | null = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(normalizarTransacao);
  } catch {
    return [];
  }
}

export function guardarTransacoes(transacoes: Transaction[]): void {
  localStorage.setItem(KEY, JSON.stringify(transacoes));
}