import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CAIXA_API_BASE } from "@/lib/constants";
import { invalidateHistoricoCache } from "@/lib/historico";

export async function GET() {
  try {
    const res = await fetch(CAIXA_API_BASE, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-cache",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch latest draw: ${res.status}`);
    }

    const data = await res.json();
    const concurso = parseInt(data.numero, 10);
    const drawDate = data.dataApuracao as string;
    const [b1, b2, b3, b4, b5, b6] = (data.listaDezenas as string[]).map(
      (d) => parseInt(d, 10)
    );

    await db.execute(`CREATE TABLE IF NOT EXISTS history (
      concurso INTEGER PRIMARY KEY,
      data TEXT,
      bola1 INT,
      bola2 INT,
      bola3 INT,
      bola4 INT,
      bola5 INT,
      bola6 INT
    )`);

    const existing = await db.execute({
      sql: "SELECT 1 FROM history WHERE concurso = ?",
      args: [concurso],
    });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO history (concurso, data, bola1, bola2, bola3, bola4, bola5, bola6)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
        args: [concurso, drawDate, b1, b2, b3, b4, b5, b6],
      });
      // New draw inserted, refresh cache
      invalidateHistoricoCache();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

