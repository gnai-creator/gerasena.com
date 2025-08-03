import { db } from "./db";

export interface GeneratedRow {
  id: number;
  numbers: number[];
  created_at: string;
}

let initialized = false;

async function ensureTable(): Promise<void> {
  if (initialized) return;
  await db.execute(`CREATE TABLE IF NOT EXISTS gerador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bola1 INT,
    bola2 INT,
    bola3 INT,
    bola4 INT,
    bola5 INT,
    bola6 INT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  initialized = true;
}

export async function saveGenerated(numbers: number[]): Promise<void> {
  await ensureTable();
  // Garantir que os números sejam únicos e ordenados
  const unique = Array.from(new Set(numbers)).sort((a, b) => a - b);
  if (unique.length !== 6) return;

  // Evitar inserir jogos já existentes
  const exists = await db.execute({
    sql: `SELECT 1 FROM gerador WHERE bola1 = ? AND bola2 = ? AND bola3 = ? AND bola4 = ? AND bola5 = ? AND bola6 = ? LIMIT 1`,
    args: unique,
  });
  if ((exists.rows as unknown[]).length) return;

  await db.execute({
    sql: `INSERT INTO gerador (bola1, bola2, bola3, bola4, bola5, bola6, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: unique,
  });
}

export async function getGenerated(): Promise<GeneratedRow[]> {
  await ensureTable();
  const res = await db.execute(
    `SELECT id, bola1, bola2, bola3, bola4, bola5, bola6, created_at FROM gerador ORDER BY id DESC`
  );
  return res.rows.map((r: any) => ({
    id: r.id,
    numbers: [r.bola1, r.bola2, r.bola3, r.bola4, r.bola5, r.bola6].map((n: any) => parseInt(n, 10)),
    created_at: r.created_at,
  }));
}
