import { NextResponse } from "next/server";
import { saveGenerated, getGenerated } from "@/lib/generated";

/**
 * Returns stored games. Optionally filter by a target contest number or date
 * via the `target` query parameter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") ?? undefined;
  const data = await getGenerated(target ?? undefined);
  return NextResponse.json(data);
}

/**
 * Saves a generated game.
 * Accepts a body with `numbers` and an optional `target` identifying the
 * contest number or draw date the game is meant for.
 */
export async function POST(req: Request) {
  const { numbers, target } = await req.json();
  if (!Array.isArray(numbers)) {
    return NextResponse.json({ error: "numbers required" }, { status: 400 });
  }
  await saveGenerated(numbers, typeof target === "string" ? target : undefined);
  return NextResponse.json({ ok: true });
}
