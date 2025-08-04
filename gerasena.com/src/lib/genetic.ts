import { FEATURES } from "./features";
import type { FeatureResult } from "./historico";
import seedrandom from "seedrandom";
import { SUM_TOLERANCE } from "./constants";

const PRIMES = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59,
]);

function std(nums: number[]): number {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance =
    nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

function rand(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function uniqueGame(nums: number[]): number[] {
  return nums
    .filter((n, i) => nums.indexOf(n) === i)
    .sort((a, b) => a - b)
    .slice(0, 6);
}

function randomGame(rng: () => number): number[] {
  const set = new Set<number>();
  while (set.size < 6) {
    set.add(rand(rng, 1, 60));
  }
  return uniqueGame(Array.from(set));
}

function crossover(rng: () => number, a: number[], b: number[]): number[] {
  const set = new Set([...a.slice(0, 3), ...b.slice(3)]);
  while (set.size < 6) {
    set.add(rand(rng, 1, 60));
  }
  return uniqueGame(Array.from(set));
}

function mutate(rng: () => number, game: number[]) {
  if (rng() < 0.1) {
    const idx = rand(rng, 0, 5);
    let n = rand(rng, 1, 60);
    while (game.includes(n)) n = rand(rng, 1, 60);
    game[idx] = n;
    const unique = uniqueGame(game);
    game.splice(0, game.length, ...unique);
  }
}

function computeFeatures(
  game: number[],
  histFreq: number[],
  prevDraw: number[],
  histPos: number[]
): Record<string, number> {
  const sorted = [...game].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = (sorted[2] + sorted[3]) / 2;
  const modeHist = Math.max(...sorted.map((n) => histFreq[n - 1] || 0));
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
  const repeatHist = sorted.filter((n) => (histFreq[n - 1] || 0) > 0).length;
  const avgHistFreq =
    sorted.reduce((acc, n) => acc + (histFreq[n - 1] || 0), 0) / sorted.length;
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
    sorted.reduce((acc, n) => acc + (histPos[n - 1] || 0), 0) / sorted.length;
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
      hotSum += histFreq[n - 1] || 0;
      hotCount++;
    }
    if (coldNumbers.has(n)) {
      coldSum += histFreq[n - 1] || 0;
      coldCount++;
    }
  });
  const hotAvg = hotCount ? hotSum / hotCount : 0;
  const coldAvg = coldCount ? coldSum / coldCount : 0;
  const hotColdBalance = hotAvg - coldAvg;

  return {
    sum,
    mean,
    median,
    mode_hist: modeHist,
    range,
    std: sd,
    perc_even: percEven,
    perc_odd: percOdd,
    prime_freq: primeFreq,
    quadrant_counts: quadrantStd,
    sequences,
    avg_distance: avgDist,
    min_distance: minDist,
    max_distance: maxDist,
    repeat_prev: repeatPrev,
    repeat_hist: repeatHist,
    avg_hist_freq: avgHistFreq,
    sum_digits: sumDigits,
    last_digit_counts: lastDigitStd,
    avg_hist_position: avgHistPos,
    tens_group_counts: tensGroupStd,
    mirror_numbers: mirrorCount,
    sum_odd_positions: sumOddPositions,
    sum_even_positions: sumEvenPositions,
    hot_cold_balance: hotColdBalance,
  };
}

function fitness(game: number[], features: FeatureResult): number {
  const values = computeFeatures(
    game,
    features.histFreq,
    features.prevDraw,
    features.histPos
  );
  let error = 0;
  for (const f of FEATURES) {
    if (f === "sum") continue;
    const target = features[f];
    if (typeof target === "number") {
      const diff = values[f] - target;
      error += diff * diff;
    }
  }
  return -error;
}

function gameKey(game: number[]): string {
  return [...game].sort((a, b) => a - b).join(",");
}

export function generateGames(
  _features: FeatureResult,
  populationSize = 100,
  generations = 50,
  seed?: string,
  sumTolerance = SUM_TOLERANCE
): number[][] {
  const rng = seed ? seedrandom(seed) : Math.random;

  let sumRange: [number, number] | null = null;
  if (typeof _features.sum === "number") {
    sumRange = [_features.sum - sumTolerance, _features.sum + sumTolerance];
  } else if (Array.isArray(_features.sum)) {
    sumRange = [
      _features.sum[0] - sumTolerance,
      _features.sum[1] + sumTolerance,
    ];
  }

  if (sumRange) {
    const min = Math.max(sumRange[0], 21);
    const max = Math.min(sumRange[1], 345);
    if (min > max) {
      sumRange = null;
    } else {
      sumRange = [min, max];
    }
  }

  const population: number[][] = [];
  const seen = new Set<string>();
  let attempts = 0;
  const maxAttempts = populationSize * 10;
  while (population.length < populationSize && attempts < maxAttempts) {
    attempts++;
    const game = randomGame(rng);
    const sum = game.reduce((a, b) => a + b, 0);
    if (sumRange && (sum < sumRange[0] || sum > sumRange[1])) continue;
    const key = gameKey(game);
    if (!seen.has(key)) {
      seen.add(key);
      population.push(game);
    }
  }

  for (let g = 0; g < generations; g++) {
    const scored = population
      .map((p) => ({ p, s: fitness(p, _features) }))
      .sort((a, b) => b.s - a.s);

    const survivors: number[][] = [];
    const survivorKeys = new Set<string>();

    for (const { p } of scored) {
      const key = gameKey(p);
      if (!survivorKeys.has(key)) {
        survivorKeys.add(key);
        survivors.push(p);
      }
      if (survivors.length >= populationSize / 2) break;
    }

    let childAttempts = 0;
    const maxChildAttempts = populationSize * 10;
    while (
      survivors.length < populationSize &&
      childAttempts < maxChildAttempts
    ) {
      childAttempts++;
      if (survivors.length === 0) break;
      const a = survivors[rand(rng, 0, survivors.length - 1)];
      const b = survivors[rand(rng, 0, survivors.length - 1)];
      const child = crossover(rng, a, b);
      mutate(rng, child);
      const sum = child.reduce((acc, n) => acc + n, 0);
      if (sumRange && (sum < sumRange[0] || sum > sumRange[1])) continue;
      const key = gameKey(child);
      if (!survivorKeys.has(key)) {
        survivorKeys.add(key);
        survivors.push(child);
      }
    }

    population.length = 0;
    population.push(...survivors);
  }

  const games = population.map((g) => [...g].sort((a, b) => a - b));
  return games.filter((game, index, arr) => {
    const sum = game.reduce((acc, n) => acc + n, 0);
    if (sumRange && (sum < sumRange[0] || sum > sumRange[1])) return false;
    const key = game.join(",");
    return arr.findIndex((g) => g.join(",") === key) === index;
  });
}
