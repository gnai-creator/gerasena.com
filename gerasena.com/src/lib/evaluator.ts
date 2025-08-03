import * as tf from "@tensorflow/tfjs";

export interface ScoredGame {
  numbers: number[];
  score: number;
}

function evaluateGame(numbers: number[]): number {
  const tensor = tf.tensor1d(numbers);
  const sum = tensor.sum().arraySync() as number;
  tensor.dispose();
  return sum / (60 * 6);
}

export function evaluateGames(games: number[][]): ScoredGame[] {
  return games
    .map((g) => ({ numbers: g, score: evaluateGame(g) }))
    .sort((a, b) => b.score - a.score);
}
