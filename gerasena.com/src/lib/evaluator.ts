import * as tf from "@tensorflow/tfjs";

export interface ScoredGame {
  numbers: number[];
  score: number;
}

function evaluateGame(
  numbers: number[],
  freq: number[],
  historyLength: number
): number {
  const tensor = tf.tensor1d(numbers);
  const sum = tensor.sum().arraySync() as number;
  const mean = sum / numbers.length;
  const std = tf
    .tidy(() => tensor.sub(mean).square().mean().sqrt().arraySync()) as number;
  tensor.dispose();

  const avgFreq =
    numbers.reduce((acc, n) => acc + freq[n - 1], 0) / numbers.length;
  const rarity = historyLength ? 1 - avgFreq / historyLength : 1;
  const distribution = std / 20; // normalize typical spread

  return (sum / (60 * 6)) * rarity * distribution;
}

export function evaluateGames(
  games: number[][],
  history: number[][]
): ScoredGame[] {
  const freq = Array(60).fill(0);
  history.flat().forEach((n) => {
    if (n >= 1 && n <= 60) freq[n - 1]++;
  });
  const len = history.length;

  const unique: number[][] = [];
  const seen = new Set<string>();
  for (const g of games) {
    const sorted = [...g].sort((a, b) => a - b);
    const key = sorted.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(sorted);
    }
  }

  return unique
    .map((g) => ({ numbers: g, score: evaluateGame(g, freq, len) }))
    .sort((a, b) => b.score - a.score);
}
