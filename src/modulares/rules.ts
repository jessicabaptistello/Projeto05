export type Rules = {
  DESCRICAO_MAX: number;
  VALOR_MAX_DIGITOS_INTEIRO: number;
  VALOR_MAX_DECIMAIS: number;
  VALOR_MAX: number;
  VALOR_MIN: number;
};

export const RULES: Rules = {
  DESCRICAO_MAX: 25,
  VALOR_MAX_DIGITOS_INTEIRO: 7,
  VALOR_MAX_DECIMAIS: 2,
  VALOR_MAX: 9999999,
  VALOR_MIN: 0.01,
};