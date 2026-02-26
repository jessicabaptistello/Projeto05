import {
  elements,
  initUI,
  renderTotals,
  renderList,
  setupCategoryButtons,
} from "./modulares/userInterface.js";

import {
  obterTransacoes,
  limparTudo,
  exportarJSON,
  exportarCSV,
} from "./modulares/state.js";

import { submitTransaction } from "./modulares/transactions.js";

function mostrarDataNoTopo() {
  const calendarioEl = document.querySelector(".calendario");
  if (!calendarioEl) return;

  calendarioEl.textContent = `Hoje: ${new Date().toLocaleDateString("pt-PT")}`;
}

function limparTextoDoValor(texto) {
  let s = String(texto ?? "");

  s = s.replace(/[^\d.,]/g, "");

  const posVirgula = s.indexOf(",");
  const posPonto = s.indexOf(".");

  let posSeparador = -1;
  let separador = "";

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

  let inteiro = "";
  let decimal = "";

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

function configurarInputDeValor() {
  const input = elements.quantidade;
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    const bloquear = ["e", "E", "+", "-"];
    if (bloquear.includes(e.key)) e.preventDefault();
  });

  input.addEventListener("input", () => {
    input.value = limparTextoDoValor(input.value);
  });
}

function aplicarFiltros(transacoes) {
  const filtroTexto = document.querySelector(".filtro-texto");
  const filtroTipo = document.querySelector(".filtro-tipo");

  const texto = (filtroTexto?.value || "").toLowerCase().trim();
  const tipo = filtroTipo?.value || "todos";

  return transacoes.filter((t) => {
    const desc = (t.descricao || "").toLowerCase();
    const okTexto = texto === "" || desc.includes(texto);
    const okTipo = tipo === "todos" || t.tipo === tipo;
    return okTexto && okTipo;
  });
}

function atualizarTela() {
  const todas = obterTransacoes();
  const filtradas = aplicarFiltros(todas);

  renderTotals();
  renderList(filtradas, atualizarTela);
}

function baixarArquivo({ filename, content, mimeType }) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function configurarBotoes() {

  elements.buttonAdicionar.addEventListener("click", (e) => {
    e.preventDefault();
    submitTransaction(atualizarTela);
  });

  elements.buttonLimpar.addEventListener("click", () => {
    const ok = confirm("Tem certeza que deseja excluir todas as transações?");
    if (!ok) return;

    limparTudo();
    atualizarTela();
  });

  const botaoExportar = document.querySelector(".exportar");
  if (botaoExportar) {
    botaoExportar.addEventListener("click", () => {
      const transacoes = obterTransacoes();

      if (transacoes.length === 0) {
        alert("Não há transações para exportar.");
        return;
      }

      const stamp = new Date()
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

  const filtroTexto = document.querySelector(".filtro-texto");
  const filtroTipo = document.querySelector(".filtro-tipo");

  if (filtroTexto) filtroTexto.addEventListener("input", atualizarTela);
  if (filtroTipo) filtroTipo.addEventListener("change", atualizarTela);
}

document.addEventListener("DOMContentLoaded", () => {
  const ok = initUI();
  if (!ok) return;

  mostrarDataNoTopo();
  setupCategoryButtons();
  configurarInputDeValor();
  configurarBotoes();

  atualizarTela();
});
