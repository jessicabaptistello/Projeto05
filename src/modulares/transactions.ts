import { elements } from "./userInterface.js";
import { adicionarTransacao } from "./state.js";
import { RULES } from "./rules.js";
import type { RefreshFn, TransactionInput, TransactionType } from "./types.js";

const categoriasPorTipo: Record<TransactionType, string[]> = {
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

function dataDeHojePT(): string {
  return new Date().toLocaleDateString("pt-PT");
}

type FormData = {
  descricao: string;
  valorTexto: string;
  tipo: TransactionType;
  categoria: string;
  valor?: number; 
};

function lerFormulario(): FormData {

  const descricaoEl = elements.descricao!;
  const quantidadeEl = elements.quantidade!;
  const tipoEl = elements.tipo!;

  return {
    descricao: descricaoEl.value.trim(),
    valorTexto: String(quantidadeEl.value || "").trim(),
    tipo: tipoEl.value as TransactionType,
    categoria: elements.categoriaSelecionada || "Outros",
  };
}

function valorTextoEhValido(valorTexto: string): boolean {
  const txt: string = String(valorTexto).trim();

  const pattern: RegExp = /^\d+([.,]\d{1,2})?$/;
  if (!pattern.test(txt)) return false;

  const normalized: string = txt.replace(",", ".");
  const [inteiro, dec = ""]: string[] = normalized.split(".");

  if (inteiro.length > RULES.VALOR_MAX_DIGITOS_INTEIRO) return false;
  if (dec.length > RULES.VALOR_MAX_DECIMAIS) return false;

  return true;
}

function converterValorTextoParaNumero(valorTexto: string): number {
  const normalized: string = String(valorTexto).trim().replace(",", ".");
  return Number(normalized);
}

function validarFormulario(data: FormData): boolean {
  if (!data.descricao) {
    alert("Preencha a descrição.");
    return false;
  }

  if (data.descricao.length > RULES.DESCRICAO_MAX) {
    alert(`Máximo ${RULES.DESCRICAO_MAX} caracteres.`);
    return false;
  }

  const tiposValidos: TransactionType[] = ["receita", "despesa", "poupanca"];
  if (!tiposValidos.includes(data.tipo)) {
    alert("Selecione um tipo válido.");
    return false;
  }

  const permitidas: string[] = categoriasPorTipo[data.tipo] || [];
  if (!permitidas.includes(data.categoria)) {
    alert(
      `A categoria "${data.categoria}" não pode ser usada com o tipo "${data.tipo}".`
    );
    return false;
  }

  if (!data.valorTexto) {
    alert("Insira um valor.");
    return false;
  }

  if (!valorTextoEhValido(data.valorTexto)) {
    alert(
      "Valor inválido. Use exemplo: 10,50 ou 10.50 (máx 7 dígitos e 2 decimais)."
    );
    return false;
  }

  const numero: number = converterValorTextoParaNumero(data.valorTexto);

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

function limparFormulario(): void {
  const descricaoEl = elements.descricao!;
  const quantidadeEl = elements.quantidade!;
  const tipoEl = elements.tipo!;

  descricaoEl.value = "";
  quantidadeEl.value = "";
  tipoEl.value = "receita";
}

function enviarTransacao(refresh: RefreshFn): void {
  const data: FormData = lerFormulario();
  if (!validarFormulario(data)) return;

  const payload: TransactionInput = {
    descricao: data.descricao,
    valor: data.valor!, 
    tipo: data.tipo,
    categoria: data.categoria,
    data: dataDeHojePT(),
  };

  adicionarTransacao(payload);
  limparFormulario();
  refresh();
}

export const submitTransaction = enviarTransacao;