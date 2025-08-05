import { db } from "./db";
import { FEATURES, selectMatrix } from "./features";
import { QTD_HIST } from "./constants";
import type * as tfTypes from "@tensorflow/tfjs";
import path from "path";

/**
 * Simple in-memory cache for draw history.  Because this project runs in a
 * server environment we can keep the fetched draws between requests and avoid
 * hitting the database for every call.  The cache is invalidated whenever new
 * draws are inserted through the `/api/scrap` route.
 */
let historicoCache: Draw[] | null = null;

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

const HISTORICO_CACHE = new Map<string, Draw[]>();
let csvCache: { draws: Draw[]; mtimeMs: number } | null = null;

export function invalidateHistoricoCache() {
  historicoCache = null;
  csvCache = null;
  HISTORICO_CACHE.clear();
}

export async function getCachedHistorico(
  limit = QTD_HIST,
  offset = 0,
  before?: number,
  desc = true
): Promise<Draw[]> {
  const key = `${limit}-${offset}-${before ?? ""}-${desc}`;
  if (HISTORICO_CACHE.has(key)) {
    return HISTORICO_CACHE.get(key)!;
  }
  const draws = await getHistorico(limit, offset, before, desc);
  HISTORICO_CACHE.set(key, draws);
  return draws;
}

export async function getHistorico(

  limit = QTD_HIST,
  offset = 0,
  before?: number,
  desc = true
): Promise<Draw[]> {
  const allDraws = await loadHistorico();
  let filtered = before !== undefined
    ? allDraws.filter((d) => d.concurso < before)
    : [...allDraws];

  filtered.sort((a, b) => (desc ? b.concurso - a.concurso : a.concurso - b.concurso));
  return filtered.slice(offset, offset + limit);
}

async function loadHistorico(): Promise<Draw[]> {
  if (historicoCache) return historicoCache;
  try {
    const res = await db.execute({
      sql: `SELECT concurso, data, bola1, bola2, bola3, bola4, bola5, bola6 FROM history ORDER BY concurso ASC`,
    });
    const rows = res.rows as unknown as Draw[];
    if (rows.length) {
      historicoCache = rows;
      return historicoCache;
    }
    historicoCache = await getHistoricoFromCsvFull();
    return historicoCache;
  } catch (error) {
    if (
      error instanceof Error &&
      (/no such table: history/i.test(error.message) ||
        /SQL read operations are forbidden/i.test(error.message) ||
        ("code" in error && (error as any).code === "BLOCKED"))
    ) {
      historicoCache = await getHistoricoFromCsvFull();
      return historicoCache;
    }
    throw error;
  }
}

async function getHistoricoFromCsv(
  limit: number,
  offset: number,
  before?: number,
  desc = true
): Promise<Draw[]> {

  const csvPath = path.join(process.cwd(), "public", "mega-sena.csv");
  const fs = await import("fs/promises");


  const stats = await fs.stat(csvPath);
  if (!csvCache || stats.mtimeMs > csvCache.mtimeMs) {
    const file = await fs.readFile(csvPath, "utf8");
    csvCache = {
      draws: file
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => {
          const [concurso, data, b1, b2, b3, b4, b5, b6] = line.split(",");
          return {
            concurso: parseInt(concurso, 10),
            data,
            bola1: parseInt(b1, 10),
            bola2: parseInt(b2, 10),
            bola3: parseInt(b3, 10),
            bola4: parseInt(b4, 10),
            bola5: parseInt(b5, 10),
            bola6: parseInt(b6, 10),
          };
        }),
      mtimeMs: stats.mtimeMs,
    };
  }

  let draws =
    before !== undefined
      ? csvCache.draws.filter((d) => d.concurso < before)
      : csvCache.draws.slice();

  draws.sort((a, b) => (desc ? b.concurso - a.concurso : a.concurso - b.concurso));
  return draws.slice(offset, offset + limit);
}

async function getHistoricoFromCsvFull(): Promise<Draw[]> {
  return getHistoricoFromCsv(Number.MAX_SAFE_INTEGER, 0);
}

export function clearHistoricoCache(): void {
  csvCache = null;
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
  const modeHist = Math.max(...sorted.map((n) => histFreq[n - 1]));
  const range = sorted[sorted.length - 1] - sorted[0];
  const sd = std(sorted);
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
    lastDigitStd,
    avgHistPos,
    tensGroupStd,
    mirrorCount,
    hotColdBalance,
  ];
}

export interface FeatureResult {
  histFreq: number[];
  prevDraw: number[];
  histPos: number[];
  /** Historical min/max range for draw sums */
  sumRange?: [number, number];
  matrixKey?: string;
  allowedNumbers?: number[];
  [key: string]: number | string | [number, number] | number[] | undefined;
}

export async function analyzeHistorico(
  before?: number
): Promise<FeatureResult> {
  const tf: typeof tfTypes = await import("@tensorflow/tfjs");
  const result: FeatureResult = {
    histFreq: [],
    prevDraw: [],
    histPos: [],
  };
  FEATURES.forEach((f) => (result[f] = 0));
  const historico = await getCachedHistorico(QTD_HIST, 0, before);
  console.log("analyzing historico with", historico.length, "draws");
  if (historico.length < 2) return result;

  const draws = [...historico].reverse();
  const freq = Array(60).fill(0);
  const posSum = Array(60).fill(0);
  const posCount = Array(60).fill(0);
  const featureVectors: number[][] = [];
  const sums: number[] = [];
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
    const [sum, ...feats] = computeFeatures(nums, freq, prevDraw, histPos);
    featureVectors.push(feats);
    sums.push(sum);

    nums.forEach((n, idx) => {
      freq[n - 1]++;
      posCount[n - 1]++;
      posSum[n - 1] += idx + 1;
    });
    prevDraw = nums;
  }

  const sumRange: [number, number] = [Math.min(...sums), Math.max(...sums)];

  const xs = tf.tensor2d(featureVectors.slice(0, -1));
  const ys = tf.tensor2d(featureVectors.slice(1));
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [FEATURES.length],
      units: 32,
      activation: "relu",
    })
  );

  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 128, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 256, activation: "relu" }));

  model.add(tf.layers.dense({ units: 128, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 64, activation: "relu" }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: FEATURES.length }));
  model.compile({ loss: "meanSquaredError", optimizer: tf.train.adam(0.01) });
  await model.fit(xs, ys, { epochs: 100, verbose: 0 });
  const last = tf.tensor2d([featureVectors[featureVectors.length - 1]]);
  const prediction = model.predict(last) as tfTypes.Tensor;
  const values = Array.from(prediction.dataSync());

  FEATURES.forEach((f, i) => {
    result[f] = values[i];
  });
  // Store the historical min/max range of sums separately for potential use.
  result.sumRange = sumRange;

  const histPos = posSum.map((s, i) => (posCount[i] ? s / posCount[i] : 0));
  result.histFreq = freq;
  result.prevDraw = prevDraw;
  result.histPos = histPos;

  const { key, numbers } = selectMatrix(result);
  result.matrixKey = key;
  result.allowedNumbers = numbers;

  model.dispose();
  tf.dispose([xs, ys, last, prediction]);
  return result;
}
