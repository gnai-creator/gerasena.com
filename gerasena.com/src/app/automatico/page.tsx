"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateGames } from "@/lib/genetic";
import type { Draw } from "@/lib/historico";
import { QTD_HIST, QTD_GERAR, QTD_GERAR_MAX } from "@/lib/constants";

function AutomaticoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const concursoParam = searchParams.get("concurso");
  const baseConcurso = concursoParam ? parseInt(concursoParam, 10) : undefined;
  const qtdParam = searchParams.get("qtd");
  const qtdGerar = qtdParam
    ? Math.min(Math.max(parseInt(qtdParam, 10), 1), QTD_GERAR_MAX)
    : QTD_GERAR;

  useEffect(() => {
    async function run() {
      const { analyzeHistorico } = await import("@/lib/historico");
      const { evaluateGames } = await import("@/lib/evaluator");
      const features = await analyzeHistorico(baseConcurso);
      const games = generateGames(features, qtdGerar);
      const res = await fetch(
        `/api/historico?limit=${QTD_HIST}${
          baseConcurso ? `&before=${baseConcurso}` : ""
        }`
      );
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
  }, [router, baseConcurso, qtdGerar]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Processando...</p>
    </main>
  );
}

export default function Automatico() {
  return (
    <Suspense fallback={<p>Processando...</p>}>
      <AutomaticoContent />
    </Suspense>
  );
}
