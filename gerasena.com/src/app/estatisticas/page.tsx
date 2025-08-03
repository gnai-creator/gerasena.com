"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Stat {
  concurso: number;
  hits: number;
}

export default function Estatisticas() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  const data = {
    labels: stats.map((s) => s.concurso),
    datasets: [
      {
        label: "Acertos",
        data: stats.map((s) => s.hits),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h2 className="mb-4 text-xl font-semibold">Estatísticas</h2>
      <Bar data={data} />
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Concurso</th>
            <th className="px-2 py-1 text-left">Acertos</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.concurso} className="odd:bg-gray-100">
              <td className="px-2 py-1">{s.concurso}</td>
              <td className="px-2 py-1">{s.hits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/">Voltar</Link>
    </main>
  );
}
