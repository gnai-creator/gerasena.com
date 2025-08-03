"use client";

interface Props {
  numbers: number[];
  score: number;
}

export function GameCard({ numbers, score }: Props) {
  return (
    <div className="rounded border p-4 shadow">
      <div className="mb-2 grid grid-cols-6 gap-2 text-center font-mono">
        {numbers.map((n) => (
          <span key={n} className="rounded bg-gray-200 p-1">
            {n}
          </span>
        ))}
      </div>
      <p className="text-sm">Probabilidade: {(score * 100).toFixed(2)}%</p>
    </div>
  );
}
