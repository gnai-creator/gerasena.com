import { db } from "./db";
import { FEATURES } from "./features";

export interface Draw {
  concurso: number;
  data: string;
  bola1: number;
  bola2: number;
  bola3: number;
  bola4: number;
  bola5: number;
  bola6: number;
}

export async function getHistorico(limit = 50): Promise<Draw[]> {
  try {
    const res = await db.execute({
      sql: `SELECT concurso, data, bola1, bola2, bola3, bola4, bola5, bola6 FROM history ORDER BY concurso DESC LIMIT ?`,
      args: [limit],
    });
    return res.rows as unknown as Draw[];
  } catch (error) {
    // If the history table is missing (e.g. when the database hasn't been
    // seeded yet), gracefully fall back to an empty list so that static builds
    // do not fail.
    if (error instanceof Error && /no such table: history/i.test(error.message)) {
      return [];
    }
    throw error;
  }
}

export function analyzeHistorico(): Record<string, number> {
  const result: Record<string, number> = {};
  FEATURES.forEach((f) => (result[f] = 0));
  return result;
}
