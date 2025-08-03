"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Draw } from "@/lib/historico";

interface Props {
  initialDraws: Draw[];
}

export default function HistoricoTable({ initialDraws }: Props) {
  const [draws, setDraws] = useState<Draw[]>(initialDraws);
  const [offset, setOffset] = useState(initialDraws.length);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/historico?limit=50&offset=${offset}`);
    const data: Draw[] = await res.json();
    setDraws((prev) => [...prev, ...data]);
    setOffset((prev) => prev + data.length);
    if (data.length === 0) {
      setHasMore(false);
    }
    setLoading(false);
  }, [offset]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        loadMore();
      }
    });
    const el = loaderRef.current;
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [loading, hasMore, loadMore]);

  return (
    <>
      <table className="w-full text-sm text-center">
        <thead>
          <tr>
            <th className="px-2 py-1">Concurso</th>
            <th className="px-2 py-1">Data</th>
            <th className="px-2 py-1">Dezenas</th>
          </tr>
        </thead>
        <tbody>
          {draws.map((d) => (
            <tr key={d.concurso} className="odd:bg-gray-100 text-green-500">
              <td className="px-2 py-1">{d.concurso}</td>
              <td className="px-2 py-1">{d.data}</td>
              <td className="px-2 py-1">
                {[d.bola1, d.bola2, d.bola3, d.bola4, d.bola5, d.bola6].join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={loaderRef} className="py-4">
        {loading && <p>Carregando...</p>}
        {!hasMore && <p>Fim do histórico</p>}
      </div>
    </>
  );
}

