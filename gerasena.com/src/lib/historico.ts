import { db } from "./db";
import { FEATURES } from "./features";
import type * as tfTypes from "@tensorflow/tfjs";

export interface Draw {
  concurso: number;
  data: string;
  bola1: number;
  bola2: number;
  bola3: number;
  bola4: number;
  bola5: number;
  bola6: number;
}

export async function getHistorico(
  limit = 50,
  offset = 0,
  before?: number
): Promise<Draw[]> {
  try {
    const res = await db.execute({
      sql: before
        ? `SELECT concurso, data, bola1, bola2, bola3, bola4, bola5, bola6 FROM history WHERE concurso < ? ORDER BY concurso DESC LIMIT ? OFFSET ?`
        : `SELECT concurso, data, bola1, bola2, bola3, bola4, bola5, bola6 FROM history ORDER BY concurso DESC LIMIT ? OFFSET ?`,
      args: before ? [before, limit, offset] : [limit, offset],
    });
    return res.rows as unknown as Draw[];
  } catch (error) {
    // If the history table is missing (e.g. when the database hasn't been
    // seeded yet), gracefully fall back to an empty list so that static builds
    // do not fail.
    if (error instanceof Error && /no such table: history/i.test(error.message)) {
      return [];
    }
    throw error;
  }
}

const PRIMES = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59,
]);

function std(nums: number[]): number {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance =
    nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

function computeFeatures(
  game: number[],
  histFreq: number[],
  prevDraw: number[],
  histPos: number[]
): number[] {
  const sorted = [...game].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = (sorted[2] + sorted[3]) / 2;
  const modeHist = Math.max(...sorted.map((n) => histFreq[n - 1]));
  const range = sorted[sorted.length - 1] - sorted[0];
  const sd = Math.sqrt(
    sorted.reduce((acc, n) => acc + (n - mean) ** 2, 0) / sorted.length
  );
  const evenCount = sorted.filter((n) => n % 2 === 0).length;
  const percEven = (evenCount / sorted.length) * 100;
  const percOdd = 100 - percEven;
  const primeFreq =
    (sorted.filter((n) => PRIMES.has(n)).length / sorted.length) * 100;
  const quadrants = [0, 0, 0, 0];
  sorted.forEach((n) => {
    if (n <= 15) quadrants[0]++;
    else if (n <= 30) quadrants[1]++;
    else if (n <= 45) quadrants[2]++;
    else quadrants[3]++;
  });
  const quadrantStd = std(quadrants);
  const sequences = sorted.filter((n, i) => sorted[i + 1] - n === 1).length;
  const diffs = sorted.slice(0, -1).map((n, i) => sorted[i + 1] - n);
  const avgDist = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const minDist = Math.min(...diffs);
  const maxDist = Math.max(...diffs);
  const repeatPrev = prevDraw.filter((n) => sorted.includes(n)).length;
  const repeatHist = sorted.filter((n) => histFreq[n - 1] > 0).length;
  const avgHistFreq =
    sorted.reduce((acc, n) => acc + histFreq[n - 1], 0) / sorted.length;
  const sumDigits = sorted.reduce(
    (acc, n) =>
      acc +
      n
        .toString()
        .split("")
        .reduce((a, d) => a + parseInt(d, 10), 0),
    0
  );
  const lastDigitCounts = Array(10).fill(0);
  sorted.forEach((n) => lastDigitCounts[n % 10]++);
  const lastDigitStd = std(lastDigitCounts);
  const avgHistPos =
    sorted.reduce((acc, n) => acc + histPos[n - 1], 0) / sorted.length;
  const tensGroupCounts = Array(6).fill(0);
  sorted.forEach((n) => tensGroupCounts[Math.floor((n - 1) / 10)]++);
  const tensGroupStd = std(tensGroupCounts);

  const numSet = new Set(sorted);
  let mirrorCount = 0;
  numSet.forEach((n) => {
    const mirror = parseInt(
      n.toString().padStart(2, "0").split("").reverse().join(""),
      10
    );
    if (mirror !== n && mirror <= 60 && numSet.has(mirror) && n < mirror) {
      mirrorCount++;
    }
  });

  const sumOddPositions = sorted
    .filter((_n, i) => i % 2 === 0)
    .reduce((a, b) => a + b, 0);
  const sumEvenPositions = sorted
    .filter((_n, i) => i % 2 === 1)
    .reduce((a, b) => a + b, 0);

  const freqPairs = histFreq.map((freq, i) => ({ num: i + 1, freq }));
  const hotNumbers = new Set(
    [...freqPairs]
      .sort((a, b) => b.freq - a.freq || a.num - b.num)
      .slice(0, 10)
      .map((p) => p.num)
  );
  const coldNumbers = new Set(
    [...freqPairs]
      .sort((a, b) => a.freq - b.freq || a.num - b.num)
      .slice(0, 10)
      .map((p) => p.num)
  );
  let hotSum = 0,
    hotCount = 0,
    coldSum = 0,
    coldCount = 0;
  sorted.forEach((n) => {
    if (hotNumbers.has(n)) {
      hotSum += histFreq[n - 1];
      hotCount++;
    }
    if (coldNumbers.has(n)) {
      coldSum += histFreq[n - 1];
      coldCount++;
    }
  });
  const hotAvg = hotCount ? hotSum / hotCount : 0;
  const coldAvg = coldCount ? coldSum / coldCount : 0;
  const hotColdBalance = hotAvg - coldAvg;

  return [
    sum,
    mean,
    median,
    modeHist,
    range,
    sd,
    percEven,
    percOdd,
    primeFreq,
    quadrantStd,
    sequences,
    avgDist,
    minDist,
    maxDist,
    repeatPrev,
    repeatHist,
    avgHistFreq,
    sumDigits,
    lastDigitStd,
    avgHistPos,
    tensGroupStd,
    mirrorCount,
    sumOddPositions,
    sumEvenPositions,
    hotColdBalance,
  ];
}

export async function analyzeHistorico(
  before?: number
): Promise<Record<string, number | [number, number]>> {
  const tf: typeof tfTypes = await import("@tensorflow/tfjs");
  const result: Record<string, number | [number, number]> = {};
  FEATURES.forEach((f) => (result[f] = 0));
  const historico = await getHistorico(50, 0, before);
  if (historico.length < 2) return result;

  const draws = [...historico].reverse();
  const freq = Array(60).fill(0);
  const posSum = Array(60).fill(0);
  const posCount = Array(60).fill(0);
  const featureVectors: number[][] = [];
  let prevDraw: number[] = [];

  for (const draw of draws) {
    const nums = [
      draw.bola1,
      draw.bola2,
      draw.bola3,
      draw.bola4,
      draw.bola5,
      draw.bola6,
    ];
    const histPos = posSum.map((s, i) => (posCount[i] ? s / posCount[i] : 0));
    const feats = computeFeatures(nums, freq, prevDraw, histPos);
    featureVectors.push(feats);

    nums.forEach((n, idx) => {
      freq[n - 1]++;
      posCount[n - 1]++;
      posSum[n - 1] += idx + 1;
    });
    prevDraw = nums;
  }

  const sums = featureVectors.map((v) => v[0]);
  const sumRange: [number, number] = [
    Math.min(...sums),
    Math.max(...sums),
  ];

  const xs = tf.tensor2d(featureVectors.slice(0, -1));
  const ys = tf.tensor2d(featureVectors.slice(1));
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [FEATURES.length], units: 64, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({ units: 128, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // ou linear, dependendo do objetivo
  
  model.compile({
    loss: "meanSquaredError", // ou "binaryCrossentropy" se for classificação
    optimizer: tf.train.adam(0.001),
  });
  
  await model.fit(xs, ys, { epochs: 200, verbose: 0 });
  const last = tf.tensor2d([featureVectors[featureVectors.length - 1]]);
  const prediction = model.predict(last) as tfTypes.Tensor;
  const values = Array.from(prediction.dataSync());

  FEATURES.forEach((f, i) => {
    result[f] = values[i];
  });
  result.sum = sumRange;

  tf.dispose([xs, ys, last, prediction]);
  return result;
}
