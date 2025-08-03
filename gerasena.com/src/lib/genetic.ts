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

export function generateGames(
  _features: Record<string, number>,
  populationSize = 100,
  generations = 50
): number[][] {
  let population: number[][] = Array.from({ length: populationSize }, randomGame);

  for (let g = 0; g < generations; g++) {
    const scored = population
      .map((p) => ({ p, s: fitness(p) }))
      .sort((a, b) => b.s - a.s);
    const survivors = scored.slice(0, populationSize / 2).map((x) => x.p);
    while (survivors.length < populationSize) {
      const a = survivors[rand(0, survivors.length - 1)];
      const b = survivors[rand(0, survivors.length - 1)];
      const child = crossover(a, b);
      mutate(child);
      survivors.push(child);
    }
    population = survivors;
  }

  return population;
}
