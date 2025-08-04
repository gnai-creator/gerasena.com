import { NextResponse } from "next/server";
import { getHistorico } from "@/lib/historico";
import { getGenerated } from "@/lib/generated";

function parseBrDate(d: string): Date {
  const [day, month, year] = d.split("/");
  return new Date(`${year}-${month}-${day}`);
}

/**
 * Returns hit statistics correlating generated games with actual draws.
 * Optionally filter games by a contest number or date through the `target`
 * query parameter.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") ?? undefined;
  const draws = await getHistorico(1000);
  const generated = await getGenerated(target ?? undefined);
  const results = [] as { concurso: number; hits: number }[];

  for (const g of generated) {
    let draw;
    if (g.target) {
      const contest = parseInt(g.target, 10);
      if (!isNaN(contest)) {
        draw = draws.find((d) => d.concurso === contest);
      } else {
        const targetDate = g.target.includes("/")
          ? parseBrDate(g.target)
          : new Date(g.target);
        draw = draws.find((d) => parseBrDate(d.data) >= targetDate);
      }
    } else {
      const genDate = new Date(g.created_at);
      draw = draws.find((d) => parseBrDate(d.data) >= genDate);
    }
    if (!draw) continue;
    const drawNums = [
      draw.bola1,
      draw.bola2,
      draw.bola3,
      draw.bola4,
      draw.bola5,
      draw.bola6,
    ];
    const hits = g.numbers.filter((n) => drawNums.includes(n)).length;
    results.push({ concurso: draw.concurso, hits });
  }

  return NextResponse.json(results);
}
