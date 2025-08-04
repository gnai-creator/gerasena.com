"use client";

// src/app/arquivo/page.tsx
// Envia um arquivo dos export txt do site e calcula os resultados do(s)
// concurso(s) informado(s). A página deve possuir um campo para escolher o
// concurso, um campo para selecionar o arquivo exportado e um botão para
// disparar o cálculo. O resultado final mostra quantos jogos tiveram 0, 1, 2,
// ..., 6 acertos para cada concurso selecionado.

import { useState, useRef } from "react";
import Link from "next/link";
import type { Draw } from "@/lib/historico";

interface ContestResult {
  concurso: number;
  counts: number[]; // index represents number of hits
  expected: number[]; // expected counts for each number of hits
  hasSena: boolean;
  hasQuina: boolean;
  hasQuadra: boolean;
  score: number;
  expectedScore: number;
}

function combinacao(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

function probabilidadeEsperada(acertos: number): number {
  const totalCombinacoes = combinacao(60, 6);
  const combAcertos = combinacao(6, acertos) * combinacao(54, 6 - acertos);
  return combAcertos / totalCombinacoes;
}

function calcularPontuacao(freq: number[]): number {
  return freq[3] * 3 + freq[4] * 10 + freq[5] * 50 + freq[6] * 200;
}

export default function Arquivo() {
  const [concursos, setConcursos] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ContestResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCalculate() {
    if (!file || !concursos.trim()) return;
    const text = await file.text();
    const games = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) =>
        line
          .split(/[-\s]+/)
          .map((n) => parseInt(n, 10))
          .filter((n) => !isNaN(n))
      );
    const concursoNums = concursos
      .split(",")
      .map((c) => parseInt(c.trim(), 10))
      .filter((n) => !isNaN(n));

    const allNums = new Set<number>();
    for (const g of games) {
      for (const n of g) allNums.add(n);
    }

    const expectedBase = Array.from(
      { length: 7 },
      (_, hits) => probabilidadeEsperada(hits) * games.length
    );
    const expectedScoreBase = calcularPontuacao(expectedBase);

    const resArr: ContestResult[] = [];
    for (const concurso of concursoNums) {
      const resp = await fetch(`/api/historico?limit=1&before=${concurso + 1}`);
      const draws: Draw[] = await resp.json();
      const draw = draws.find((d) => d.concurso === concurso);
      if (!draw) continue;
      const drawNums = [
        draw.bola1,
        draw.bola2,
        draw.bola3,
        draw.bola4,
        draw.bola5,
        draw.bola6,
      ];
      const counts = Array(7).fill(0);
      for (const g of games) {
        const hits = g.filter((n) => drawNums.includes(n)).length;
        counts[hits]++;
      }
      const hasSena = drawNums.every((n) => allNums.has(n));
      const hasQuina = counts[5] > 0;
      const hasQuadra = counts[4] > 0;
      const score = calcularPontuacao(counts);
      resArr.push({
        concurso,
        counts,
        expected: expectedBase.slice(),
        hasSena,
        hasQuina,
        hasQuadra,
        score,
        expectedScore: expectedScoreBase,
      });
    }
    setResults(resArr);
  }

  return (
    <main className="mx-auto max-w-3xl p-4 text-center">
      <h2 className="mb-4 text-xl font-semibold">Calcular Arquivo</h2>
      <input
        type="text"
        value={concursos}
        onChange={(e) => setConcursos(e.target.value)}
        placeholder="Concursos (ex: 1234,1235)"
        className="mb-2 w-full rounded border px-4 py-2"
      />
      <input
        type="file"
        accept=".txt"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-2 block mx-auto rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
      >
        {file ? file.name : "Selecionar arquivo"}
      </button>
      <button
        onClick={handleCalculate}
        className="mb-4 block mx-auto rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Calcular
      </button>
      {results.map((r) => {
        const prizes: string[] = [];
        if (r.hasQuina) prizes.push("quina");
        if (r.hasQuadra) prizes.push("quadra");
        return (
          <div key={r.concurso} className="mb-4">
            <h3 className="font-semibold">Concurso {r.concurso}</h3>
            <table className="mx-auto mt-2 text-sm ">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Acertos</th>
                  <th className="px-2 py-1 text-left">Quantidade</th>
                  <th className="px-2 py-1 text-left">Esperado</th>
                </tr>
              </thead>
              <tbody>
                {r.counts.map((c, i) => (
                  <tr key={i} className="odd:bg-gray-100 text-green-600">
                    <td className="px-2 py-1">{i}</td>
                    <td className="px-2 py-1">{c}</td>
                    <td className="px-2 py-1">{r.expected[i].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm">
              Pontuação: {r.score.toFixed(2)} (esperado{" "}
              {r.expectedScore.toFixed(2)}) —{" "}
              {r.score > r.expectedScore
                ? "Acima da expectativa."
                : r.score < r.expectedScore
                ? "Abaixo da expectativa."
                : "Na expectativa."}
            </p>
            <p className="mt-2 text-sm">
              {r.hasSena
                ? "As dezenas do concurso estão presentes nos números do arquivo."
                : prizes.length > 0
                ? `Há ${prizes.join(" e ")} entre os jogos do arquivo.`
                : "As dezenas do concurso não aparecem todas nos números do arquivo."}
            </p>
          </div>
        );
      })}
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
