function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGame(): number[] {
  const nums: number[] = [];
  while (nums.length < 6) {
    const n = rand(1, 60);
    if (!nums.includes(n)) nums.push(n);
  }
  return nums.sort((a, b) => a - b);
}

function crossover(a: number[], b: number[]): number[] {
  const set = new Set([...a.slice(0, 3), ...b.slice(3)]);
  while (set.size < 6) {
    set.add(rand(1, 60));
  }
  return Array.from(set)
    .sort((x, y) => x - y)
    .slice(0, 6);
}

function mutate(game: number[]) {
  if (Math.random() < 0.1) {
    const idx = rand(0, 5);
    let n = rand(1, 60);
    while (game.includes(n)) n = rand(1, 60);
    game[idx] = n;
    game.sort((a, b) => a - b);
  }
}

function fitness(_game: number[]): number {
  return Math.random();
}

function gameKey(game: number[]): string {
  return game.join(",");
}

export function generateGames(
  _features: Record<string, number>,
  populationSize = 100,
  generations = 50
): number[][] {
  const population: number[][] = [];
  const seen = new Set<string>();
  while (population.length < populationSize) {
    const game = randomGame();
    const key = gameKey(game);
    if (!seen.has(key)) {
      seen.add(key);
      population.push(game);
    }
  }

  for (let g = 0; g < generations; g++) {
    const scored = population
      .map((p) => ({ p, s: fitness(p) }))
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

    while (survivors.length < populationSize) {
      const a = survivors[rand(0, survivors.length - 1)];
      const b = survivors[rand(0, survivors.length - 1)];
      const child = crossover(a, b);
      mutate(child);
      const key = gameKey(child);
      if (!survivorKeys.has(key)) {
        survivorKeys.add(key);
        survivors.push(child);
      }
    }

    population.length = 0;
    population.push(...survivors);
  }

  return population;
}
