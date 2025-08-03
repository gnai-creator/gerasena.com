"use client";
import { useEffect, useState } from "react";
import { GameCard } from "@/components/GameCard";
import Link from "next/link";

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
    <main className="mx-auto min-h-screen max-w-2xl p-4 text-center">
      <h2 className="mb-4 text-xl font-semibold">Resultados</h2>
      <div className="grid gap-4">
        {games.map((g, idx) => (
          <GameCard key={idx} numbers={g.numbers} score={g.score} />
        ))}
      </div>
      <Link href="/"
        className="rounded bg-green-600 px-4 py-2 text-white text-center hover:bg-green-700"

      >Voltar</Link>
    </main>
  );
}
