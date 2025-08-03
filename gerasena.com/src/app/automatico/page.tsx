"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { analyzeHistorico } from "@/lib/historico";
import { generateGames } from "@/lib/genetic";
import { evaluateGames } from "@/lib/evaluator";

export default function Automatico() {
  const router = useRouter();

  useEffect(() => {
    const features = analyzeHistorico();
    const games = generateGames(features);
    const evaluated = evaluateGames(games);
    sessionStorage.setItem("results", JSON.stringify(evaluated));
    router.push("/resultado");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Processando...</p>
    </main>
  );
}
