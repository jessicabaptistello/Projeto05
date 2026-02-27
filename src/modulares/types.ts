export type TransactionType = "receita" | "despesa" | "poupanca";

export type Transaction = {
  id: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: string;
  data: string;
};

export type TransactionInput = Omit<Transaction, "id">; 
export type Totals = {
  balance: number;
  income: number;
  expense: number;
  savings: number;
};

export type RefreshFn = () => void; 

export type DownloadPayload = {
  filename: string;
  content: string;
  mimeType: string;
};