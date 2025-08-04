import { db } from "./db";

export interface GeneratedRow {
  id: number;
  numbers: number[];
  created_at: string;
  /** Optional contest number or target draw date associated with the game */
  target?: string | null;
}

let initialized = false;

async function ensureTable(): Promise<void> {
  if (initialized) return;
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS gerador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bola1 INT,
    bola2 INT,
    bola3 INT,
    bola4 INT,
    bola5 INT,
    bola6 INT,
    target TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

    // ensure new column exists if table was created previously
    try {
      const cols = await db.execute(`PRAGMA table_info(gerador)`);
      const hasTarget = (cols.rows as any[]).some((c: any) => c.name === "target");
      if (!hasTarget) {
        await db.execute(`ALTER TABLE gerador ADD COLUMN target TEXT`);
      }
    } catch {
      // ignore errors from stubbed db clients
    }
  } catch (error) {
    if (
      !("code" in (error as any) && (error as any).code === "BLOCKED") &&
      !(error instanceof Error && /SQL read operations are forbidden/i.test(error.message))
    ) {
      throw error;
    }
  }

  initialized = true;
}

/**
 * Persist a generated game.
 * @param numbers The six numbers that compose the game.
 * @param target Optional contest number or target draw date associated with the game.
 */
export async function saveGenerated(
  numbers: number[],
  target?: string
): Promise<void> {
  await ensureTable();
  // Garantir que os números sejam únicos e ordenados
  const unique = Array.from(new Set(numbers)).sort((a, b) => a - b);
  if (unique.length !== 6) return;

  try {
    // Evitar inserir jogos já existentes
    const exists = await db.execute({
      sql: `SELECT 1 FROM gerador WHERE bola1 = ? AND bola2 = ? AND bola3 = ? AND bola4 = ? AND bola5 = ? AND bola6 = ? LIMIT 1`,
      args: unique,
    });
    if ((exists.rows as unknown[]).length) return;

    await db.execute({
      sql: `INSERT INTO gerador (bola1, bola2, bola3, bola4, bola5, bola6, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [...unique, target ?? null],
    });
  } catch (error) {
    if (
      ("code" in (error as any) && (error as any).code === "BLOCKED") ||
      (error instanceof Error && /SQL read operations are forbidden/i.test(error.message))
    ) {
      return;
    }
    throw error;
  }
}

/**
 * Retrieve generated games, optionally filtering by a target identifier.
 * @param target Contest number or draw date to filter by.
 */
export async function getGenerated(target?: string): Promise<GeneratedRow[]> {
  await ensureTable();
  try {
    const res = target
      ? await db.execute({
          sql: `SELECT id, bola1, bola2, bola3, bola4, bola5, bola6, target, created_at FROM gerador WHERE target = ? ORDER BY id DESC`,
          args: [target],
        })
      : await db.execute(
          `SELECT id, bola1, bola2, bola3, bola4, bola5, bola6, target, created_at FROM gerador ORDER BY id DESC`
        );
    return res.rows.map((r: any) => ({
      id: r.id,
      numbers: [r.bola1, r.bola2, r.bola3, r.bola4, r.bola5, r.bola6].map((n: any) => parseInt(n, 10)),
      target: r.target ?? null,
      created_at: r.created_at,
    }));
  } catch (error) {
    if (
      ("code" in (error as any) && (error as any).code === "BLOCKED") ||
      (error instanceof Error && /SQL read operations are forbidden/i.test(error.message))
    ) {
      return [];
    }
    throw error;
  }
}
