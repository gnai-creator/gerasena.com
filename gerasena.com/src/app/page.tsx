"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { QTD_GERAR_MAX } from "@/lib/constants";
import FallingLogosBackground from "@/components/FallingLogosBackground";

export default function Home() {
  const [concurso, setConcurso] = useState("");
  const [qtd, setQtd] = useState("1000");
  const [mutation, setMutation] = useState("0.25");
  const [population, setPopulation] = useState("200");
  const [generations, setGenerations] = useState("100");

  const params = new URLSearchParams();
  if (concurso) params.set("concurso", concurso);
  if (qtd) params.set("qtd", qtd);
  if (mutation) params.set("mutation", mutation);
  if (population) params.set("population", population);
  if (generations) params.set("generations", generations);
  const query = params.toString();

  return (
    <>
      <FallingLogosBackground />
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Image src="/logo.png" alt="Gerasena" width={100} height={100} />
        <h1 className="text-2xl font-bold">Gerasena</h1>
        <h1 className="text-2xl font-bold">Gere Jogos da Mega-Sena</h1>
        <div className="flex gap-4 flex-col">
          <input
            type="number"
            value={concurso}
            onChange={(e) => setConcurso(e.target.value)}
            placeholder="Concurso base"
            className="rounded border px-4 py-2 bg-black text-white"
          />
          <input
            type="number"
            value={qtd}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setQtd("");
              } else {
                const num = Math.min(parseInt(val, 10), QTD_GERAR_MAX);
                setQtd(num.toString());
              }
            }}
            placeholder="Quantidade de jogos"
            className="rounded border px-4 py-2 bg-black text-white"
            min={1}
            max={QTD_GERAR_MAX}
          />
          <input
            type="number"
            value={mutation}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setMutation("");
              } else {
                const num = Math.min(parseFloat(val), 1.0);
                setMutation(num.toString());
              }
            }}
            placeholder="Tx de mutação (0.0 - 1.0)"
            className="rounded border px-4 py-2 bg-black text-white"
            min={0.0}
            max={1.0}
          />
          <input
            type="number"
            value={population}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setPopulation("200");
              } else {
                const num = Math.min(parseInt(val, 10), 1000);
                setPopulation(num.toString());
              }
            }}
            placeholder="Tamanho da população"
            className="rounded border px-4 py-2 bg-black text-white"
            min={1}
            max={1000}
          />
          <input
            type="number"
            value={generations}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setGenerations("100");
              } else {
                const num = Math.min(parseInt(val, 10), 1000);
                setGenerations(num.toString());
              }
            }}
            placeholder="Gerações"
            className="rounded border px-4 py-2 bg-black text-white"
            min={1}
            max={1000}
          />
          <Link
            href={`/automatico${query ? `?${query}` : ""}`}
            className="rounded bg-green-600 px-4 py-2 text-white text-center hover:bg-green-700"
          >
            Automático
          </Link>
          <Link
            href="/historico"
            className="rounded bg-gray-600 px-4 py-2 text-white text-center hover:bg-gray-700"
          >
            Histórico
          </Link>
          {/* <Link
            href="/estatisticas"
            className="rounded bg-gray-600 px-4 py-2 text-white text-center hover:bg-gray-700"
          >
            Estatísticas
          </Link> */}
          <Link
            href="/arquivo"
            className="rounded bg-gray-600 px-4 py-2 text-white text-center hover:bg-gray-700"
          >
            Calcular Arquivo
          </Link>
          <a
            href="https://github.com/gnai-creator/gerasena.com"
            className="rounded bg-gray-600 px-4 py-2 text-white text-center hover:bg-gray-700"
          >
            Código Fonte
          </a>
        </div>
      </main>
    </>
  );
}
