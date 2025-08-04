export const QTD_HIST = 100;

// Quantidade de jogos a serem gerados pelo algoritmo genético.
// Pode ser ajustado via variável de ambiente `NEXT_PUBLIC_QTD_GERAR`.
export const QTD_GERAR = parseInt(
  process.env.NEXT_PUBLIC_QTD_GERAR || "100",
  10,
);
