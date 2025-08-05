"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FEATURES } from "@/lib/features";
import { FeatureSelector } from "@/components/FeatureSelector";
import { generateGames } from "@/lib/genetic";
import Link from "next/link";
import type { Draw, FeatureResult } from "@/lib/historico";
import { QTD_HIST, QTD_GERAR, QTD_GERAR_MAX } from "@/lib/constants";

const GROUP_SIZE = 4;
const GROUPS = Array.from(
  { length: Math.ceil(FEATURES.length / GROUP_SIZE) },
  (_v, i) => FEATURES.slice(i * GROUP_SIZE, i * GROUP_SIZE + GROUP_SIZE)
);

function ManualContent() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, [number, number]>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const concursoParam = searchParams.get("concurso");
  const baseConcurso = concursoParam ? parseInt(concursoParam, 10) : undefined;
  const qtdParam = searchParams.get("qtd");
  const qtdGerar = qtdParam
    ? Math.min(Math.max(parseInt(qtdParam, 10), 1), QTD_GERAR_MAX)
    : QTD_GERAR;
  const seedParam = searchParams.get("seed") || "";
  const [seed, setSeed] = useState(seedParam);

  const toggle = (f: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (f in next) {
        delete next[f];
      } else {
        next[f] = [0, 0];
      }
      return next;
    });
  };

  const setValue = (f: string, value: [number, number]) => {
    setSelected((prev) => ({ ...prev, [f]: value }));
  };

  const next = async () => {
    if (step < GROUPS.length - 1) {
      setStep(step + 1);
    } else {
      const features: FeatureResult = {
        histFreq: [],
        prevDraw: [],
        histPos: [],
      };
      Object.assign(features, selected);
      const generations = qtdGerar > 5000 ? 80 : 50;
      const games = generateGames(
        features,
        qtdGerar,
        generations,
        seed || undefined
      );
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
      const { evaluateGames } = await import("@/lib/evaluator");
      const evaluated = evaluateGames(games, history);
      evaluated.forEach((g) => {
        fetch("/api/generated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numbers: g.numbers }),
        });
      });
      const targetConcurso =
        baseConcurso !== undefined ? baseConcurso : draws[0].concurso + 1;
      sessionStorage.setItem("concurso", String(targetConcurso));
      sessionStorage.setItem(
        "concursoDate",
        new Date().toISOString().slice(0, 10)
      );
      sessionStorage.setItem("results", JSON.stringify(evaluated));
      router.push("/resultado");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4 text-center">
      <h2 className="text-xl font-semibold">
        Passo {step + 1} de {GROUPS.length}
      </h2>
      <FeatureSelector
        features={GROUPS[step]}
        selected={selected}
        onToggle={toggle}
        onChange={setValue}
      />
      <input
        type="text"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
        placeholder="Semente (opcional)"
        className="rounded border px-2 py-1"
      />
      <button
        onClick={next}
        className="mt-auto rounded bg-blue-600 px-4 py-2 text-white"
      >
        {step < GROUPS.length - 1 ? "Próximo" : "Gerar"}
      </button>
      <br />
      <Link
        href="/"
        className="rounded bg-green-600 px-4 py-2 text-white text-center hover:bg-green-700"
      >
        Voltar
      </Link>
    </main>
  );
}

export default function Manual() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <ManualContent />
    </Suspense>
  );
}
