import { carregarTransacoes, guardarTransacoes } from "./storage.js";

let transacoes = carregarTransacoes();

export function obterTransacoes() {
  return [...transacoes];
}

function salvar() {
  guardarTransacoes(transacoes);
}

function criarId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function adicionarTransacao(nova) {
  const transacao = {
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

export function removerTransacao(id) {
  transacoes = transacoes.filter((t) => t.id !== id);
  salvar();
}

export function limparTudo() {
  transacoes = [];
  salvar();
}

export function atualizarTransacao(id, camposAtualizados) {
  transacoes = transacoes.map((t) => {
    if (t.id !== id) return t;
    return { ...t, ...camposAtualizados };
  });

  salvar();
}

export function calcularTotais() {
  return transacoes.reduce(
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

export function exportarJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    total: transacoes.length,
    transactions: transacoes,
  };
  return JSON.stringify(data, null, 2);
}

export function exportarCSV() {
  const header = ["id", "descricao", "valor", "tipo", "categoria", "data"];

  function escapeCSV(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  const lines = [header.join(",")];

  for (const t of transacoes) {
    lines.push([t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data].map(escapeCSV).join(","));
  }

  return lines.join("\n");
}
