"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateGames } from "@/lib/genetic";
import type { Draw } from "@/lib/historico";

export default function Automatico() {
  const router = useRouter();

  useEffect(() => {
    async function run() {
      const { analyzeHistorico } = await import("@/lib/historico");
      const { evaluateGames } = await import("@/lib/evaluator");
      const features = await analyzeHistorico();
      const games = generateGames(features);
      const res = await fetch("/api/historico");
      const draws: Draw[] = await res.json();
      const history = draws.map((d) => [
        d.bola1,
        d.bola2,
        d.bola3,
        d.bola4,
        d.bola5,
        d.bola6,
      ]);
      const evaluated = evaluateGames(games, history);
      for (const g of evaluated) {
        fetch("/api/generated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numbers: g.numbers }),
        });
      }
      sessionStorage.setItem("results", JSON.stringify(evaluated));
      router.push("/resultado");
    }
    run();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Processando...</p>
    </main>
  );
}
