function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniqueGame(nums: number[]): number[] {
  return Array.from(new Set(nums))
    .sort((a, b) => a - b)
    .slice(0, 6);
}

function randomGame(): number[] {
  const set = new Set<number>();
  while (set.size < 6) {
    set.add(rand(1, 60));
  }
  return uniqueGame(Array.from(set));
}

function crossover(a: number[], b: number[]): number[] {
  const set = new Set([...a.slice(0, 3), ...b.slice(3)]);
  while (set.size < 6) {
    set.add(rand(1, 60));
  }
  return uniqueGame(Array.from(set));
}

function mutate(game: number[]) {
  if (Math.random() < 0.1) {
    const idx = rand(0, 5);
    let n = rand(1, 60);
    while (game.includes(n)) n = rand(1, 60);
    game[idx] = n;
    const unique = uniqueGame(game);
    game.splice(0, game.length, ...unique);
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

  return Array.from(new Map(population.map((g) => [gameKey(g), g])).values());
}
