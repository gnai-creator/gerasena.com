// src/lib/constants.ts
// Constantes usadas no projeto Gerasena

// Quantidade de sorteios analisados para prever o próximo resultado.
// Um histórico maior torna o modelo menos suscetível a oscilações.
export const QTD_HIST = 200;

// Quantidade de jogos a serem gerados pelo algoritmo genético.
export const QTD_GERAR = 100;

// Limite máximo de jogos que podem ser gerados pelo usuário.
export const QTD_GERAR_MAX = 10000;

// Tolerância aplicada à soma prevista ao gerar jogos.
export const SUM_TOLERANCE = 20;

export const SITE_URL = "https://gerasena.com";

export const CAIXA_API_BASE =
  "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena";

export const MEGA_SENA_PAGE =
  "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx";

export const SCRAPER_INTERVAL_MS = 480000;
