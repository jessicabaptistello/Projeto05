const KEY = "transactions_v1";

function normalizarTransacao(t) {
  return {
    id: t?.id ?? `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    descricao: String(t?.descricao ?? ""),
    valor: Number(t?.valor) || 0,
    tipo: t?.tipo ?? "receita",
    categoria: t?.categoria ?? "Outros",
    data: t?.data ?? t?.date ?? "",
  };
}

export function carregarTransacoes() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(normalizarTransacao);
  } catch {
    return [];
  }
}

export function guardarTransacoes(transacoes) {
  localStorage.setItem(KEY, JSON.stringify(transacoes));
}
