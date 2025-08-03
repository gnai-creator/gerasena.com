import { NextResponse } from "next/server";
import { getHistorico } from "@/lib/historico";

export async function GET() {
  const draws = await getHistorico(50);
  return NextResponse.json(draws);
}
