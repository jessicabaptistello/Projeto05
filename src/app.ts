import { elements, initUI, renderTotals, renderList, setupCategoryButtons } from "./modulares/userInterface.js";
import { obterTransacoes, limparTudo, exportarJSON, exportarCSV } from "./modulares/state.js";
import { submitTransaction } from "./modulares/transactions.js";
import type { DownloadPayload, Transaction, RefreshFn } from "./modulares/types.js";

function mostrarDataNoTopo(): void {
  const calendarioEl: Element | null = document.querySelector(".calendario");
  if (!calendarioEl) return;

  (calendarioEl as HTMLElement).textContent =
    `Hoje: ${new Date().toLocaleDateString("pt-PT")}`;
}

function limparTextoDoValor(texto: string): string {
  let s: string = String(texto ?? "");
  s = s.replace(/[^\d.,]/g, "");

  const posVirgula: number = s.indexOf(",");
  const posPonto: number = s.indexOf(".");

  let posSeparador: number = -1;
  let separador: string = "";

  if (posVirgula !== -1 && posPonto !== -1) {
    if (posVirgula < posPonto) {
      posSeparador = posVirgula;
      separador = ",";
    } else {
      posSeparador = posPonto;
      separador = ".";
    }
  } else if (posVirgula !== -1) {
    posSeparador = posVirgula;
    separador = ",";
  } else if (posPonto !== -1) {
    posSeparador = posPonto;
    separador = ".";
  }

  let inteiro: string = "";
  let decimal: string = "";

  if (posSeparador === -1) {
    inteiro = s.replace(/[^\d]/g, "");
  } else {
    inteiro = s.slice(0, posSeparador).replace(/[^\d]/g, "");
    decimal = s.slice(posSeparador + 1).replace(/[^\d]/g, "");
  }

  if (inteiro.length > 7) inteiro = inteiro.slice(0, 7);
  if (decimal.length > 2) decimal = decimal.slice(0, 2);
  if (posSeparador === -1) return inteiro;
  if (decimal.length === 0) return `${inteiro}${separador}`;
  return `${inteiro}${separador}${decimal}`;
}

function configurarInputDeValor(): void {
  const input = elements.quantidade;
  if (!input) return;

  input.addEventListener("keydown", (e: KeyboardEvent) => {
    const bloquear: string[] = ["e", "E", "+", "-"];
    if (bloquear.includes(e.key)) e.preventDefault();
  });

  input.addEventListener("input", () => {
    input.value = limparTextoDoValor(input.value);
  });
}

function aplicarFiltros(transacoes: Transaction[]): Transaction[] {
  const filtroTexto = document.querySelector<HTMLInputElement>(".filtro-texto");
  const filtroTipo = document.querySelector<HTMLSelectElement>(".filtro-tipo");

  const texto: string = (filtroTexto?.value || "").toLowerCase().trim();
  const tipo: string = filtroTipo?.value || "todos";

  return transacoes.filter((t) => {
    const desc: string = (t.descricao || "").toLowerCase();
    const okTexto: boolean = texto === "" || desc.includes(texto);
    const okTipo: boolean = tipo === "todos" || t.tipo === tipo;
    return okTexto && okTipo;
  });
}

const atualizarTela: RefreshFn = (): void => {
  const todas: Transaction[] = obterTransacoes();
  const filtradas: Transaction[] = aplicarFiltros(todas);

  renderTotals();
  renderList(filtradas, atualizarTela);
};

function baixarArquivo({ filename, content, mimeType }: DownloadPayload): void {
  const blob: Blob = new Blob([content], { type: mimeType });
  const url: string = URL.createObjectURL(blob);

  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function configurarBotoes(): void {
  const btnAdd = elements.buttonAdicionar;
  const btnLimpar = elements.buttonLimpar;

  if (btnAdd) {
    btnAdd.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault();
      submitTransaction(atualizarTela);
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const ok: boolean = confirm("Tem certeza que deseja excluir todas as transações?");
      if (!ok) return;

      limparTudo();
      atualizarTela();
    });
  }

  const botaoExportar = document.querySelector<HTMLElement>(".exportar");
  if (botaoExportar) {
    botaoExportar.addEventListener("click", () => {
      const transacoes: Transaction[] = obterTransacoes();

      if (transacoes.length === 0) {
        alert("Não há transações para exportar.");
        return;
      }

      const stamp: string = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .replaceAll(".", "-");

      baixarArquivo({
        filename: `minhas-financas-${stamp}.json`,
        content: exportarJSON(),
        mimeType: "application/json;charset=utf-8",
      });

      baixarArquivo({
        filename: `minhas-financas-${stamp}.csv`,
        content: exportarCSV(),
        mimeType: "text/csv;charset=utf-8",
      });
    });
  }

  const filtroTexto = document.querySelector<HTMLInputElement>(".filtro-texto");
  const filtroTipo = document.querySelector<HTMLSelectElement>(".filtro-tipo");

  if (filtroTexto) filtroTexto.addEventListener("input", atualizarTela);
  if (filtroTipo) filtroTipo.addEventListener("change", atualizarTela);
}

document.addEventListener("DOMContentLoaded", () => {
  const ok: boolean = initUI();
  if (!ok) return;

  mostrarDataNoTopo();
  setupCategoryButtons();
  configurarInputDeValor();
  configurarBotoes();

  atualizarTela();
});