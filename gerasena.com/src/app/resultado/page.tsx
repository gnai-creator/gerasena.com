"use client";
import { useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";

interface Game {
  numbers: number[];
  score: number;
}

export default function Resultado() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const data = sessionStorage.getItem("results");
    if (data) {
      setGames(JSON.parse(data));
    }
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4">
      <h2 className="mb-4 text-xl font-semibold">Resultados</h2>
      <div className="grid gap-4">
        {games.map((g, idx) => (
          <GameCard key={idx} numbers={g.numbers} score={g.score} />
        ))}
      </div>
    </main>
  );
}
