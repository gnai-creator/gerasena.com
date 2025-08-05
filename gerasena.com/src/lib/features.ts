// import type { FeatureResult } from "./historico";
// import { computeFeatures } from "./genetic";

export const FEATURES = [
  "sum",
  "mean",
  "median",
  "mode_hist",
  "range",
  "std",
  "perc_even",
  "perc_odd",
  "prime_freq",
  "quadrant_counts",
  "sequences",
  "avg_distance",
  "min_distance",
  "max_distance",
  "repeat_prev",
  "repeat_hist",
  "avg_hist_freq",
  "sum_digits",
  "last_digit_counts",
  "avg_hist_position",
  "tens_group_counts",
  "mirror_numbers",
  "sum_odd_positions",
  "sum_even_positions",
  "hot_cold_balance",
];

export const FEATURE_INFO: Record<
  string,
  { label: string; description: string }
> = {
  sum: {
    label: "Soma",
    description:
      "Soma de todos os números escolhidos. Pode ser usada com um valor alvo e uma tolerância configurável.",
  },
  mean: {
    label: "Média",
    description: "Média aritmética dos números escolhidos.",
  },
  median: {
    label: "Mediana",
    description: "Valor central dos números em ordem.",
  },
  mode_hist: {
    label: "Moda histórica",
    description: "Número que mais apareceu nos sorteios anteriores.",
  },
  range: {
    label: "Intervalo",
    description: "Diferença entre o maior e o menor número.",
  },
  std: {
    label: "Desvio padrão",
    description: "Medida de dispersão em relação à média.",
  },
  perc_even: {
    label: "Percentual de pares",
    description: "Porcentagem de números pares.",
  },
  perc_odd: {
    label: "Percentual de ímpares",
    description: "Porcentagem de números ímpares.",
  },
  prime_freq: {
    label: "Frequência de primos",
    description: "Quantidade de números primos.",
  },
  quadrant_counts: {
    label: "Quadrantes",
    description: "Distribuição dos números pelos quadrantes do volante.",
  },
  sequences: {
    label: "Sequências",
    description: "Quantidade de números consecutivos.",
  },
  avg_distance: {
    label: "Distância média",
    description: "Distância média entre números consecutivos.",
  },
  min_distance: {
    label: "Distância mínima",
    description: "Menor distância entre números consecutivos.",
  },
  max_distance: {
    label: "Distância máxima",
    description: "Maior distância entre números consecutivos.",
  },
  repeat_prev: {
    label: "Repetições",
    description: "Quantidade de números repetidos do último concurso.",
  },
  repeat_hist: {
    label: "Repetidas no histórico",
    description: "Quantidade de números já sorteados anteriormente.",
  },
  avg_hist_freq: {
    label: "Freq. histórica média",
    description: "Média de frequência histórica dos números.",
  },
  sum_digits: {
    label: "Soma dos dígitos",
    description: "Soma dos dígitos de cada número.",
  },
  last_digit_counts: {
    label: "Dígitos finais",
    description: "Distribuição dos dígitos finais.",
  },
  avg_hist_position: {
    label: "Posição histórica média",
    description: "Média das posições históricas nos sorteios.",
  },
  tens_group_counts: {
    label: "Grupos de dezena",
    description: "Distribuição por grupos de dezena.",
  },
  mirror_numbers: {
    label: "Números espelhados",
    description: "Quantidade de pares espelhados no jogo, como 12 e 21.",
  },
  sum_odd_positions: {
    label: "Soma posições ímpares",
    description: "Soma dos números que ocupam posições ímpares no jogo.",
  },
  sum_even_positions: {
    label: "Soma posições pares",
    description: "Soma dos números que ocupam posições pares no jogo.",
  },
  hot_cold_balance: {
    label: "Balanceamento quente/frio",
    description:
      "Diferença entre a média de frequência dos números quentes e frios, com base no histórico.",
  },
};

// export const FEATURE_MATRIX: Record<string, number[][]> = {
//   ["one"]: [
//     [1, 2, 3, 6, 7, 9],
//     [11, 12, 13, 16, 17, 19],
//     [21, 22, 23, 26, 27, 29],
//     [31, 32, 33, 36, 37, 39],
//     [41, 42, 43, 46, 47, 49],
//     [51, 52, 53, 56, 57, 59],
//   ],
//   ["two"]: [
//     [2, 4, 5, 6, 8, 10],
//     [12, 14, 15, 16, 18, 20],
//     [22, 24, 25, 26, 28, 30],
//     [32, 34, 35, 36, 38, 40],
//     [42, 44, 45, 46, 48, 50],
//     [52, 54, 55, 56, 58, 60],
//   ],
//   ["three"]: [
//     [3, 4, 5, 7, 8, 10],
//     [13, 14, 15, 17, 18, 20],
//     [23, 24, 25, 27, 28, 30],
//     [33, 34, 35, 37, 38, 40],
//     [43, 44, 45, 47, 48, 50],
//     [53, 54, 55, 57, 58, 60],
//   ],
// };

// export function selectMatrix(
//   features: FeatureResult
// ): { key: string; numbers: number[] } {
//   let selected = "one";
//   let bestError = Infinity;

//   for (const [key, matrix] of Object.entries(FEATURE_MATRIX)) {
//    const agg: Record<string, number> = {};
//    for (const f of FEATURES) agg[f] = 0;

//    for (const row of matrix) {
//      const rowFeatures = computeFeatures(
//        row,
//        features.histFreq,
//        features.prevDraw,
//        features.histPos
//      );
//      for (const f of FEATURES) {
//        agg[f] += rowFeatures[f] || 0;
//      }
//    }

//    for (const f of FEATURES) {
//      agg[f] /= matrix.length;
//    }

//    let error = 0;
//    for (const f of FEATURES) {
//      const target = features[f];
//      if (typeof target === "number") {
//        const diff = agg[f] - target;
//        error += diff * diff;
//      }
//    }

//    if (error < bestError) {
//      bestError = error;
//      selected = key;
//    }
//  }

//  const numbers = Array.from(new Set(FEATURE_MATRIX[selected].flat())).sort(
//    (a, b) => a - b
//  );
//  return { key: selected, numbers };
// }
