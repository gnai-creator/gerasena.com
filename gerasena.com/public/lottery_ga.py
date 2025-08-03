"""Lottery combination generator using Genetic Algorithms.

This script creates combinations for a lottery similar to Mega-Sena using
Genetic Algorithms. Each combination (game) consists of 6 unique numbers
between 1 and 60. The algorithm evolves an initial random population to
approximate user-specified statistical characteristics.

The 20 characteristics considered are:
1. Sum of numbers
2. Arithmetic mean
3. Median
4. Historical mode (max frequency in historical data)
5. Range (max - min)
6. Standard deviation
7. Percentage of even numbers
8. Percentage of odd numbers
9. Percentage of primes
10. Frequency per quadrant (1-15,16-30,31-45,46-60)
11. Count of sequential number pairs
12. Average distance between consecutive numbers
13. Minimum distance between consecutive numbers
14. Maximum distance between consecutive numbers
15. Count of numbers repeated from previous draw
16. Average historical frequency of numbers
17. Sum of digits of numbers
18. Frequency of last digits (0-9)
19. Average historical position of numbers
20. Frequency per tens group (1-10,...,51-60)

The script can optionally receive a JSON file with desired feature values.
If not provided, a random target is generated for demonstration purposes.
"""

from __future__ import annotations

import json
import random
import sys
from dataclasses import dataclass
from typing import Dict, List, Sequence, Tuple

import numpy as np

# -------------------------------------
# Data structures
# -------------------------------------

@dataclass
class HistoricalData:
    """Container for historical statistics used by fitness function."""

    freq: Sequence[int]  # frequency of each number historically (index 0->number1)
    prev_draw: Sequence[int]  # numbers drawn in previous contest
    position: Sequence[float]  # average historical position (1-6) of each number


# Pre-computed set of prime numbers between 1 and 60
PRIMES = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59}

# -------------------------------------
# Feature calculation helpers
# -------------------------------------

def feature_sum(game: Sequence[int]) -> int:
    return int(sum(game))

def feature_mean(game: Sequence[int]) -> float:
    return float(np.mean(game))

def feature_median(game: Sequence[int]) -> float:
    return float(np.median(game))

def feature_historical_mode(game: Sequence[int], hist_freq: Sequence[int]) -> int:
    return max(hist_freq[n - 1] for n in game)

def feature_range(game: Sequence[int]) -> int:
    return max(game) - min(game)

def feature_std(game: Sequence[int]) -> float:
    return float(np.std(game))

def feature_even_percent(game: Sequence[int]) -> float:
    return 100.0 * sum(1 for n in game if n % 2 == 0) / len(game)

def feature_odd_percent(game: Sequence[int]) -> float:
    return 100.0 * sum(1 for n in game if n % 2 == 1) / len(game)

def feature_prime_freq(game: Sequence[int]) -> float:
    return 100.0 * sum(1 for n in game if n in PRIMES) / len(game)

def feature_quadrants(game: Sequence[int]) -> List[int]:
    counts = [0, 0, 0, 0]
    for n in game:
        if n <= 15:
            counts[0] += 1
        elif n <= 30:
            counts[1] += 1
        elif n <= 45:
            counts[2] += 1
        else:
            counts[3] += 1
    return counts

def feature_sequences(game: Sequence[int]) -> int:
    sg = sorted(game)
    return sum(1 for i in range(len(sg) - 1) if sg[i + 1] - sg[i] == 1)

def _differences(game: Sequence[int]) -> List[int]:
    sg = sorted(game)
    return [sg[i + 1] - sg[i] for i in range(len(sg) - 1)]

def feature_avg_distance(game: Sequence[int]) -> float:
    diffs = _differences(game)
    return float(np.mean(diffs))

def feature_min_distance(game: Sequence[int]) -> int:
    return int(min(_differences(game)))

def feature_max_distance(game: Sequence[int]) -> int:
    return int(max(_differences(game)))

def feature_repetition_prev(game: Sequence[int], prev_draw: Sequence[int]) -> int:
    return len(set(game).intersection(prev_draw))

def feature_avg_hist_freq(game: Sequence[int], hist_freq: Sequence[int]) -> float:
    return float(np.mean([hist_freq[n - 1] for n in game]))

def feature_sum_digits(game: Sequence[int]) -> int:
    return sum(sum(int(d) for d in str(n)) for n in game)

def feature_last_digit_freq(game: Sequence[int]) -> List[int]:
    counts = [0] * 10
    for n in game:
        counts[n % 10] += 1
    return counts

def feature_hist_avg_position(game: Sequence[int], hist_pos: Sequence[float]) -> float:
    return float(np.mean([hist_pos[n - 1] for n in game]))

def feature_tens_group(game: Sequence[int]) -> List[int]:
    counts = [0] * 6
    for n in game:
        counts[(n - 1) // 10] += 1
    return counts

# Mapping of feature names to functions
FEATURE_FUNCTIONS = {
    "sum": lambda g, h: feature_sum(g),
    "mean": lambda g, h: feature_mean(g),
    "median": lambda g, h: feature_median(g),
    "mode_hist": lambda g, h: feature_historical_mode(g, h.freq),
    "range": lambda g, h: feature_range(g),
    "std": lambda g, h: feature_std(g),
    "perc_even": lambda g, h: feature_even_percent(g),
    "perc_odd": lambda g, h: feature_odd_percent(g),
    "prime_freq": lambda g, h: feature_prime_freq(g),
    "quadrant_counts": lambda g, h: feature_quadrants(g),
    "sequences": lambda g, h: feature_sequences(g),
    "avg_distance": lambda g, h: feature_avg_distance(g),
    "min_distance": lambda g, h: feature_min_distance(g),
    "max_distance": lambda g, h: feature_max_distance(g),
    "repeat_prev": lambda g, h: feature_repetition_prev(g, h.prev_draw),
    "avg_hist_freq": lambda g, h: feature_avg_hist_freq(g, h.freq),
    "sum_digits": lambda g, h: feature_sum_digits(g),
    "last_digit_counts": lambda g, h: feature_last_digit_freq(g),
    "avg_hist_position": lambda g, h: feature_hist_avg_position(g, h.position),
    "tens_group_counts": lambda g, h: feature_tens_group(g),
}

# -------------------------------------
# Core GA functions
# -------------------------------------

Game = Tuple[int, ...]

def generate_initial_population(size: int) -> List[Game]:
    population = []
    for _ in range(size):
        population.append(tuple(sorted(random.sample(range(1, 61), 6))))
    return population

def compute_features(game: Game, hist: HistoricalData) -> Dict[str, object]:
    return {name: func(game, hist) for name, func in FEATURE_FUNCTIONS.items()}

def fitness(game: Game, desired: Dict[str, object], hist: HistoricalData) -> Tuple[float, Dict[str, object]]:
    feats = compute_features(game, hist)
    err = 0.0
    for key, target in desired.items():
        value = feats[key]
        if isinstance(target, Sequence) and not isinstance(target, (str, bytes)):
            err += sum((v - t) ** 2 for v, t in zip(value, target))
        else:
            err += (value - target) ** 2
    return err, feats

def select_elites(population: List[Game], desired: Dict[str, object], hist: HistoricalData, elite_size: int) -> List[Game]:
    scored = [(fitness(ind, desired, hist)[0], ind) for ind in population]
    scored.sort(key=lambda x: x[0])
    return [ind for _, ind in scored[:elite_size]]

def crossover(parent1: Game, parent2: Game) -> Game:
    pool = set(parent1) | set(parent2)
    child = list(pool)
    if len(child) > 6:
        child = random.sample(child, 6)
    while len(child) < 6:
        n = random.randint(1, 60)
        if n not in child:
            child.append(n)
    return tuple(sorted(child))

def mutate(game: Game, rate: float = 0.05) -> Game:
    if random.random() < rate:
        game = list(game)
        idx = random.randrange(6)
        n = random.randint(1, 60)
        while n in game:
            n = random.randint(1, 60)
        game[idx] = n
        return tuple(sorted(game))
    return game

def evolve(population: List[Game], desired: Dict[str, object], hist: HistoricalData, generations: int) -> List[Game]:
    for _ in range(generations):
        elites = select_elites(population, desired, hist, elite_size=len(population) // 5)
        new_population = elites.copy()
        while len(new_population) < len(population):
            p1, p2 = random.sample(elites, 2)
            child = crossover(p1, p2)
            child = mutate(child)
            new_population.append(child)
        population = new_population
    return population

# -------------------------------------
# Utility functions
# -------------------------------------

def load_target_features(path: str) -> Dict[str, object]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def random_historical_data() -> HistoricalData:
    freq = np.random.randint(1, 100, 60).tolist()
    prev_draw = random.sample(range(1, 61), 6)
    position = np.random.uniform(1, 6, 60).tolist()
    return HistoricalData(freq=freq, prev_draw=prev_draw, position=position)

def main():
    hist = random_historical_data()
    if len(sys.argv) > 1:
        desired = load_target_features(sys.argv[1])
    else:
        # Generate a random target for demonstration
        sample_game = tuple(sorted(random.sample(range(1, 61), 6)))
        desired = compute_features(sample_game, hist)
        print("Nenhum arquivo de metas fornecido. Usando metas geradas de forma aleatória.")
        print(f"Meta baseada no jogo: {sample_game}\n")
    population = generate_initial_population(200)
    population = evolve(population, desired, hist, generations=200)
    scored = [(fitness(ind, desired, hist), ind) for ind in population]
    scored.sort(key=lambda x: x[0][0])
    best = scored[:10]
    for rank, ((err, feats), game) in enumerate(best, 1):
        print(f"Jogo {rank}: {game} | Erro: {err:.2f}")
        for k, v in feats.items():
            print(f"  {k}: {v}")
        print()

if __name__ == "__main__":
    main()
