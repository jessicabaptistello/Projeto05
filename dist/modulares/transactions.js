import { elements } from "./userInterface.js";
import { adicionarTransacao } from "./state.js";
import { RULES } from "./rules.js";
const categoriasPorTipo = {
    receita: ["Ordenado", "Outros"],
    despesa: [
        "Alimentação",
        "Educação",
        "Habitação",
        "Saúde",
        "Lazer",
        "Ginásio",
        "Outros",
    ],
    poupanca: ["Poupança", "Outros"],
};
function dataDeHojePT() {
    return new Date().toLocaleDateString("pt-PT");
}
function lerFormulario() {
    const descricaoEl = elements.descricao;
    const quantidadeEl = elements.quantidade;
    const tipoEl = elements.tipo;
    return {
        descricao: descricaoEl.value.trim(),
        valorTexto: String(quantidadeEl.value || "").trim(),
        tipo: tipoEl.value,
        categoria: elements.categoriaSelecionada || "Outros",
    };
}
function valorTextoEhValido(valorTexto) {
    const txt = String(valorTexto).trim();
    const pattern = /^\d+([.,]\d{1,2})?$/;
    if (!pattern.test(txt))
        return false;
    const normalized = txt.replace(",", ".");
    const [inteiro, dec = ""] = normalized.split(".");
    if (inteiro.length > RULES.VALOR_MAX_DIGITOS_INTEIRO)
        return false;
    if (dec.length > RULES.VALOR_MAX_DECIMAIS)
        return false;
    return true;
}
function converterValorTextoParaNumero(valorTexto) {
    const normalized = String(valorTexto).trim().replace(",", ".");
    return Number(normalized);
}
function validarFormulario(data) {
    if (!data.descricao) {
        alert("Preencha a descrição.");
        return false;
    }
    if (data.descricao.length > RULES.DESCRICAO_MAX) {
        alert(`Máximo ${RULES.DESCRICAO_MAX} caracteres.`);
        return false;
    }
    const tiposValidos = ["receita", "despesa", "poupanca"];
    if (!tiposValidos.includes(data.tipo)) {
        alert("Selecione um tipo válido.");
        return false;
    }
    const permitidas = categoriasPorTipo[data.tipo] || [];
    if (!permitidas.includes(data.categoria)) {
        alert(`A categoria "${data.categoria}" não pode ser usada com o tipo "${data.tipo}".`);
        return false;
    }
    if (!data.valorTexto) {
        alert("Insira um valor.");
        return false;
    }
    if (!valorTextoEhValido(data.valorTexto)) {
        alert("Valor inválido. Use exemplo: 10,50 ou 10.50 (máx 7 dígitos e 2 decimais).");
        return false;
    }
    const numero = converterValorTextoParaNumero(data.valorTexto);
    if (!numero || Number.isNaN(numero)) {
        alert("Valor inválido.");
        return false;
    }
    if (numero < RULES.VALOR_MIN) {
        alert(`O valor deve ser maior que ${RULES.VALOR_MIN}.`);
        return false;
    }
    if (numero > RULES.VALOR_MAX) {
        alert(`O valor máximo permitido é ${RULES.VALOR_MAX}.`);
        return false;
    }
    data.valor = Number(numero.toFixed(2));
    return true;
}
function limparFormulario() {
    const descricaoEl = elements.descricao;
    const quantidadeEl = elements.quantidade;
    const tipoEl = elements.tipo;
    descricaoEl.value = "";
    quantidadeEl.value = "";
    tipoEl.value = "receita";
}
function enviarTransacao(refresh) {
    const data = lerFormulario();
    if (!validarFormulario(data))
        return;
    const payload = {
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria: data.categoria,
        data: dataDeHojePT(),
    };
    adicionarTransacao(payload);
    limparFormulario();
    refresh();
}
export const submitTransaction = enviarTransacao;
