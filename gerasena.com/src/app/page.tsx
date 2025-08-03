"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Gere Jogos da Mega-Sena</h1>
      <div className="flex gap-4">
        <Link
          href="/manual"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Manual
        </Link>
        <Link
          href="/automatico"
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Automático
        </Link>
      </div>
    </main>
  );
}

