"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [concurso, setConcurso] = useState("");
  return (
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
          className="rounded border px-4 py-2"
        />
        <Link
          href={`/manual${concurso ? `?concurso=${concurso}` : ""}`}
          className="rounded bg-blue-600 px-4 py-2 text-white text-center hover:bg-blue-700"
        >
          Manual
        </Link>
        <Link
          href={`/automatico${concurso ? `?concurso=${concurso}` : ""}`}
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
        <Link
          href="/estatisticas"
          className="rounded bg-gray-600 px-4 py-2 text-white text-center hover:bg-gray-700"
        >
          Estatísticas
        </Link>
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
  );
}

