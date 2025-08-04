"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateGames } from "@/lib/genetic";
import type { Draw, FeatureResult } from "@/lib/historico";
import { QTD_HIST, QTD_GERAR, QTD_GERAR_MAX } from "@/lib/constants";

function AutomaticoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const concursoParam = searchParams.get("concurso");
  const baseConcurso = concursoParam ? parseInt(concursoParam, 10) : undefined;
  const qtdParam = searchParams.get("qtd");
  const qtdGerar = qtdParam ? Math.min(Math.max(parseInt(qtdParam, 10), 1), QTD_GERAR_MAX) : QTD_GERAR;
  const seed = searchParams.get("seed") || undefined;

  useEffect(() => {
    async function run() {
      const { evaluateGames } = await import("@/lib/evaluator");
      console.log("analyzing historico with baseConcurso", baseConcurso);
      const latestRes = await fetch(
        `/api/historico?limit=${QTD_HIST}${baseConcurso ? `&before=${baseConcurso}` : ""}`
      );
      const latest: Draw[] = await latestRes.json();
      const lastConcurso = latest[0]?.concurso;
      const before = lastConcurso;

      const featuresRes = await fetch(
        `/api/analyze${before ? `?before=${before}` : ""}`
      );
      const features: FeatureResult = await featuresRes.json();
      const games = generateGames(features, qtdGerar, undefined, seed);
      const res = await fetch(
        `/api/historico?limit=${QTD_HIST}${before ? `&before=${before}` : ""}`
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
  }, [router, baseConcurso, qtdGerar, seed]);

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
