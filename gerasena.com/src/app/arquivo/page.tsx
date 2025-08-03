"use client";

// src/app/arquivo/page.tsx
// Envia um arquivo dos export txt do site e calcula os resultados do(s)
// concurso(s) informado(s). A página deve possuir um campo para escolher o
// concurso, um campo para selecionar o arquivo exportado e um botão para
// disparar o cálculo. O resultado final mostra quantos jogos tiveram 0, 1, 2,
// ..., 6 acertos para cada concurso selecionado.

import { useState } from "react";
import Link from "next/link";
import type { Draw } from "@/lib/historico";

interface ContestResult {
  concurso: number;
  counts: number[]; // index represents number of hits
}

export default function Arquivo() {
  const [concursos, setConcursos] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ContestResult[]>([]);

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
      resArr.push({ concurso, counts });
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
        className="mb-2 w-full"
      />
      <button
        onClick={handleCalculate}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Calcular
      </button>
      {results.map((r) => (
        <div key={r.concurso} className="mb-4">
          <h3 className="font-semibold">Concurso {r.concurso}</h3>
          <table className="mx-auto mt-2 text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Acertos</th>
                <th className="px-2 py-1 text-left">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {r.counts.map((c, i) => (
                <tr key={i} className="odd:bg-gray-100">
                  <td className="px-2 py-1">{i}</td>
                  <td className="px-2 py-1">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
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
