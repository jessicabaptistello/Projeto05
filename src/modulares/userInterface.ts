import { calcularTotais, removerTransacao, atualizarTransacao } from "./state.js";
import { RULES } from "./rules.js";
import type { RefreshFn, Transaction } from "./types.js";

export type Elements = {
  descricao: HTMLInputElement | null;
  quantidade: HTMLInputElement | null;
  tipo: HTMLSelectElement | null;
  buttonAdicionar: HTMLButtonElement | null;
  buttonLimpar: HTMLButtonElement | null;
  lista: HTMLElement | null;
  totalBalance: HTMLElement | null;
  totalIncome: HTMLElement | null;
  totalExpense: HTMLElement | null;
  totalSavings: HTMLElement | null;
  categoriasbuttons: HTMLElement[];
  categoriaSelecionada: string;
};

export const elements: Elements = {
  descricao: null,
  quantidade: null,
  tipo: null,
  buttonAdicionar: null,
  buttonLimpar: null,
  lista: null,
  totalBalance: null,
  totalIncome: null,
  totalExpense: null,
  totalSavings: null,
  categoriasbuttons: [],
  categoriaSelecionada: "Outros",
};

function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function initUI(): boolean {
  elements.descricao = byId<HTMLInputElement>("descricao");
  elements.quantidade = byId<HTMLInputElement>("quantidade");
  elements.tipo = byId<HTMLSelectElement>("tipo-transacao");

  elements.buttonAdicionar = $(".adiciona-historia") as HTMLButtonElement | null;
  elements.buttonLimpar = $(".limpar-tudo") as HTMLButtonElement | null;

  elements.lista = $(".lista-transacoes");

  elements.totalBalance = byId<HTMLElement>("total-balance");
  elements.totalIncome = byId<HTMLElement>("total-income");
  elements.totalExpense = byId<HTMLElement>("total-expense");
  elements.totalSavings = byId<HTMLElement>("total-savings");

  elements.categoriasbuttons = Array.from(
    document.querySelectorAll<HTMLElement>(".categorias")
  );

  const missing: string[] = [];
  if (!elements.descricao) missing.push("#descricao");
  if (!elements.quantidade) missing.push("#quantidade");
  if (!elements.tipo) missing.push("#tipo-transacao");
  if (!elements.buttonAdicionar) missing.push(".adiciona-historia");
  if (!elements.buttonLimpar) missing.push(".limpar-tudo");
  if (!elements.lista) missing.push(".lista-transacoes");
  if (!elements.totalBalance) missing.push("#total-balance");
  if (!elements.totalIncome) missing.push("#total-income");
  if (!elements.totalExpense) missing.push("#total-expense");
  if (!elements.totalSavings) missing.push("#total-savings");

  if (missing.length > 0) {
    console.error("Elementos não encontrados:", missing);
    alert("Erro. Veja o Console (F12).");
    return false;
  }

  return true;
}

function formatEUR(value: number): string {
  return value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

type StatusClass = "positivo" | "negativo" | "neutro";

function setStatusClass(el: HTMLElement, status: StatusClass): void {
  el.classList.remove("positivo", "negativo", "neutro");
  el.classList.add(status);
}

export function setupCategoryButtons(): void {
  const defaultBtn: HTMLElement | undefined = elements.categoriasbuttons.find(
    (b) => b.dataset.category === "Outros"
  );
  if (defaultBtn) defaultBtn.classList.add("is-active");

  for (const button of elements.categoriasbuttons) {
    button.addEventListener("click", () => {
      for (const b of elements.categoriasbuttons) b.classList.remove("is-active");
      button.classList.add("is-active");
      elements.categoriaSelecionada = button.dataset.category || "Outros";
    });
  }
}

export function renderTotals(): void {
  const { balance, income, expense, savings } = calcularTotais();

  const totalBalance = elements.totalBalance!;
  const totalIncome = elements.totalIncome!;
  const totalExpense = elements.totalExpense!;
  const totalSavings = elements.totalSavings!;

  totalBalance.textContent = formatEUR(balance);
  totalIncome.textContent = formatEUR(income);
  totalExpense.textContent = formatEUR(expense);
  totalSavings.textContent = formatEUR(savings);

  setStatusClass(totalBalance, balance < 0 ? "negativo" : "positivo");
  setStatusClass(totalIncome, "positivo");
  setStatusClass(totalExpense, "negativo");
  setStatusClass(totalSavings, "neutro");
}

function pedirDescricao(atual: string): string | null {
  while (true) {
    const input: string | null = prompt(
      `Descrição (máx ${RULES.DESCRICAO_MAX}):`,
      atual
    );
    if (input === null) return null;

    const desc: string = input.trim();
    if (!desc) {
      alert("Descrição não pode ficar vazia.");
      continue;
    }
    if (desc.length > RULES.DESCRICAO_MAX) {
      alert(`Máximo ${RULES.DESCRICAO_MAX} caracteres.`);
      continue;
    }
    return desc;
  }
}

function pedirValor(atual: number): number | null {
  while (true) {
    const input: string | null = prompt("Valor (ex: 10,50):", String(atual));
    if (input === null) return null;

    const txt: string = input.trim();

    const pattern: RegExp = /^\d+([.,]\d{1,2})?$/;
    if (!pattern.test(txt)) {
      alert("Valor inválido. Ex: 10,50 ou 10.50");
      continue;
    }

    const normal: string = txt.replace(",", ".");
    const [inteiro, dec = ""]: string[] = normal.split(".");

    if (inteiro.length > RULES.VALOR_MAX_DIGITOS_INTEIRO) {
      alert("Máximo 7 dígitos antes da vírgula.");
      continue;
    }
    if (dec.length > RULES.VALOR_MAX_DECIMAIS) {
      alert("Máximo 2 casas decimais.");
      continue;
    }

    const num: number = Number(normal);
    if (!num || Number.isNaN(num)) {
      alert("Valor inválido.");
      continue;
    }

    if (num < RULES.VALOR_MIN) {
      alert(`O valor deve ser maior que ${RULES.VALOR_MIN}.`);
      continue;
    }
    if (num > RULES.VALOR_MAX) {
      alert(`O valor máximo permitido é ${RULES.VALOR_MAX}.`);
      continue;
    }

    return Number(num.toFixed(2));
  }
}

function pedirData(atual: string): string | null {
  const input: string | null = prompt("Data (dd/mm/aaaa):", atual);
  if (input === null) return null;
  return input.trim();
}

function criarItemTransacao(t: Transaction, refresh: RefreshFn): HTMLDivElement {
  const isDespesa: boolean = t.tipo === "despesa";
  const isReceita: boolean = t.tipo === "receita";
  const isPoupanca: boolean = t.tipo === "poupanca";

  const valorAssinado: number = isDespesa ? -t.valor : t.valor;

  const etiquetaClass: string = isDespesa
    ? "etiqueta-despesa"
    : isReceita
    ? "etiqueta-receita"
    : "etiqueta-poupanca";

  const etiquetaTexto: string = isDespesa
    ? "DESPESA"
    : isReceita
    ? "RECEITA"
    : "POUPANÇA";

  const valorClass: string = isDespesa ? "negativo" : isPoupanca ? "neutro" : "positivo";

  const div: HTMLDivElement = document.createElement("div");
  div.className = "item-transacao";

  div.innerHTML = `
    <div class="info-transacao">
      <div class="caixa-icone"><span class="real-icon">€</span></div>
      <div>
        <div class="nome-transacao">${t.descricao}</div>
        <span class="etiqueta ${etiquetaClass}">${etiquetaTexto}</span>
      </div>
    </div>

    <div class="data-transacao">${t.categoria || "-"}</div>
    <div class="data-transacao">${t.data || "-"}</div>

    <div class="valor-transacao ${valorClass}">
      <span class="valor-numero">${formatEUR(valorAssinado)}</span>

      <span class="acoes-fixas">
        <button class="button-editar" type="button" title="Editar">✏️</button>
        <button class="button-remover" type="button" title="Remover">🗑️</button>
      </span>
    </div>
  `;

  const btnEditar = div.querySelector<HTMLButtonElement>(".button-editar");
  if (!btnEditar) throw new Error("Botão editar não encontrado");
  btnEditar.addEventListener("click", () => {
    const novaDescricao = pedirDescricao(t.descricao);
    if (novaDescricao === null) return;

    const novoValor = pedirValor(t.valor);
    if (novoValor === null) return;

    const novaData = pedirData(t.data);
    if (novaData === null) return;

    atualizarTransacao(t.id, {
      descricao: novaDescricao,
      valor: novoValor,
      data: novaData,
    });

    refresh();
  });

  const btnRemover = div.querySelector<HTMLButtonElement>(".button-remover");
  if (!btnRemover) throw new Error("Botão remover não encontrado");
  btnRemover.addEventListener("click", () => {
    removerTransacao(t.id);
    refresh();
  });

  return div;
}

export function renderList(transactions: Transaction[], refresh: RefreshFn): void {
  const lista = elements.lista!;
  lista.innerHTML = "";
  for (const t of transactions) {
    lista.appendChild(criarItemTransacao(t, refresh));
  }
}