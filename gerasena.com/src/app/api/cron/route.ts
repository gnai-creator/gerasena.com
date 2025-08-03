import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), "public", "mega-sena.csv");
    const content = await fs.readFile(csvPath, "utf8");
    const lines = content.trim().split("\n").slice(1);

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

    for (const line of lines) {
      const [concurso, data, b1, b2, b3, b4, b5, b6] = line.split(",");
      await db.execute({
        sql: `INSERT OR IGNORE INTO history (concurso, data, bola1, bola2, bola3, bola4, bola5, bola6)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [concurso, data, b1, b2, b3, b4, b5, b6],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
