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

  function handleExport() {
    if (games.length === 0) return;
    const content = games.map((g) => g.numbers.join("-")).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const concurso = sessionStorage.getItem("concurso") || "0";
    const data =
      sessionStorage.getItem("concursoDate") ||
      new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `concurso_${concurso}_${data}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4 text-center">
      <button
        onClick={handleExport}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Exportar TXT
      </button>
      <h2 className="mb-4 text-xl font-semibold">Resultados</h2>
      <div className="grid gap-4">
        {games.map((g, idx) => (
          <GameCard key={idx} numbers={g.numbers} score={g.score} />
        ))}
      </div>
      <br />
      <Link href="/"
        className="rounded bg-green-600 px-4 py-2 text-white text-center hover:bg-green-700"

      >Voltar</Link>
    </main>
  );
}
