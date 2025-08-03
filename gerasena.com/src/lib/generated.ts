import { db } from "./db";

export interface GeneratedRow {
  id: number;
  numbers: number[];
  created_at: string;
}

export async function saveGenerated(numbers: number[]): Promise<void> {
  await db.execute({
    sql: `INSERT INTO generated_numbers (numbers, created_at) VALUES (?, datetime('now'))`,
    args: [numbers.join(',')],
  });
}

export async function getGenerated(): Promise<GeneratedRow[]> {
  const res = await db.execute(
    `SELECT id, numbers, created_at FROM generated_numbers ORDER BY id DESC`
  );
  return res.rows.map((r: any) => ({
    id: r.id,
    numbers: String(r.numbers)
      .split(',')
      .map((n) => parseInt(n, 10)),
    created_at: r.created_at,
  }));
}
