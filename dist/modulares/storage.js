const KEY = "transactions_v1";
function normalizarTransacao(t) {
    var _a, _b, _c, _d, _e, _f;
    return {
        id: (_a = t === null || t === void 0 ? void 0 : t.id) !== null && _a !== void 0 ? _a : `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        descricao: String((_b = t === null || t === void 0 ? void 0 : t.descricao) !== null && _b !== void 0 ? _b : ""),
        valor: Number(t === null || t === void 0 ? void 0 : t.valor) || 0,
        tipo: (_c = t === null || t === void 0 ? void 0 : t.tipo) !== null && _c !== void 0 ? _c : "receita",
        categoria: (_d = t === null || t === void 0 ? void 0 : t.categoria) !== null && _d !== void 0 ? _d : "Outros",
        data: (_f = (_e = t === null || t === void 0 ? void 0 : t.data) !== null && _e !== void 0 ? _e : t === null || t === void 0 ? void 0 : t.date) !== null && _f !== void 0 ? _f : "",
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
    catch (_a) {
        return [];
    }
}
export function guardarTransacoes(transacoes) {
    localStorage.setItem(KEY, JSON.stringify(transacoes));
}
