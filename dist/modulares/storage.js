const KEY = "transactions_v1";
function normalizarTransacao(t) {
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
    const obj = t;
    return {
        id: String(obj.id ?? `${Date.now()}-${Math.floor(Math.random() * 100000)}`),
        descricao: String(obj.descricao ?? ""),
        valor: Number(obj.valor) || 0,
        tipo: obj.tipo ?? "receita",
        categoria: String(obj.categoria ?? "Outros"),
        data: String(obj.data ?? obj.date ?? ""),
    };
}
export function carregarTransacoes() {
    const raw = localStorage.getItem(KEY);
    if (!raw)
        return [];
    try {
        const data = JSON.parse(raw);
        if (!Array.isArray(data))
            return [];
        return data.map(normalizarTransacao);
    }
    catch {
        return [];
    }
}
export function guardarTransacoes(transacoes) {
    localStorage.setItem(KEY, JSON.stringify(transacoes));
}
