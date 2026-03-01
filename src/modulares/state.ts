import type { Transaction, TransactionInput, Totals } from "./types.js";
import { carregarTransacoes, guardarTransacoes } from "./storage.js";

let transacoes: Transaction[] = carregarTransacoes();

export function obterTransacoes(): Transaction[] {
  return [...transacoes];
}

function salvar(): void {
  guardarTransacoes(transacoes);
}

function criarId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function adicionarTransacao(nova: TransactionInput): void {
  const transacao: Transaction = {
    id: criarId(),
    descricao: nova.descricao,
    valor: Number(nova.valor) || 0,
    tipo: nova.tipo,
    categoria: nova.categoria || "Outros",
    data: nova.data || "",
  };

  transacoes = [transacao, ...transacoes];
  salvar();
}

export function removerTransacao(id: string): void {
  transacoes = transacoes.filter((t) => t.id !== id);
  salvar();
}

export function limparTudo(): void {
  transacoes = [];
  salvar();
}

export function atualizarTransacao(
  id: string,
  camposAtualizados: Partial<TransactionInput>
): void {
  transacoes = transacoes.map((t) => {
    if (t.id !== id) return t;
    return { ...t, ...camposAtualizados };
  });

  salvar();
}

export function calcularTotais(): Totals {
  return transacoes.reduce<Totals>(
    (acc, t) => {
      if (t.tipo === "receita") {
        acc.income += t.valor;
        acc.balance += t.valor;
      } else if (t.tipo === "despesa") {
        acc.expense += t.valor;
        acc.balance -= t.valor;
      } else if (t.tipo === "poupanca") {
        acc.savings += t.valor;
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0, savings: 0 }
  );
}

export function exportarJSON(): string {
  const data: {
    exportedAt: string;
    total: number;
    transactions: Transaction[];
  } = {
    exportedAt: new Date().toISOString(),
    total: transacoes.length,
    transactions: transacoes,
  };

  return JSON.stringify(data, null, 2);
}

export function exportarCSV(): string {
  const header: string[] = ["id", "descricao", "valor", "tipo", "categoria", "data"];

  function escapeCSV(v: unknown): string {
    const s: string = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  const lines: string[] = [header.join(",")];

  for (const t of transacoes) {
    lines.push(
      [t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data]
        .map(escapeCSV)
        .join(",")
    );
  }

  return lines.join("\n");
}