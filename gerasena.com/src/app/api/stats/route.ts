import { NextResponse } from "next/server";
import { getHistorico } from "@/lib/historico";
import { getGenerated } from "@/lib/generated";

function parseBrDate(d: string): Date {
  const [day, month, year] = d.split("/");
  return new Date(`${year}-${month}-${day}`);
}

export async function GET() {
  const draws = await getHistorico(1000);
  const generated = await getGenerated();
  const results = [] as { concurso: number; hits: number }[];

  for (const g of generated) {
    const genDate = new Date(g.created_at);
    const draw = draws.find((d) => parseBrDate(d.data) >= genDate);
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
