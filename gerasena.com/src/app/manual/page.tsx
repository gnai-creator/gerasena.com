"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FEATURES } from "@/lib/features";
import { FeatureSelector } from "@/components/FeatureSelector";
import { generateGames } from "@/lib/genetic";
import { evaluateGames } from "@/lib/evaluator";
import Link from "next/link";

const GROUPS = [
  FEATURES.slice(0, 4),
  FEATURES.slice(4, 8),
  FEATURES.slice(8, 12),
  FEATURES.slice(12, 16),
  FEATURES.slice(16, 20),
];

export default function Manual() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const router = useRouter();

  const toggle = (f: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (f in next) {
        delete next[f];
      } else {
        next[f] = 0;
      }
      return next;
    });
  };

  const setValue = (f: string, value: number) => {
    setSelected((prev) => ({ ...prev, [f]: value }));
  };

  const next = async () => {
    if (step < GROUPS.length - 1) {
      setStep(step + 1);
    } else {
      const games = generateGames(selected);
      const evaluated = evaluateGames(games);
      evaluated.forEach((g) => {
        fetch("/api/generated", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numbers: g.numbers }),
        });
      });
      sessionStorage.setItem("results", JSON.stringify(evaluated));
      router.push("/resultado");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold">Passo {step + 1} de {GROUPS.length}</h2>
      <FeatureSelector
        features={GROUPS[step]}
        selected={selected}
        onToggle={toggle}
        onChange={setValue}
      />
      <button
        onClick={next}
        className="mt-auto rounded bg-blue-600 px-4 py-2 text-white"
      >
        {step < GROUPS.length - 1 ? "Próximo" : "Gerar"}
      </button>
      <Link href="/">Voltar</Link>
    </main>
  );
}
