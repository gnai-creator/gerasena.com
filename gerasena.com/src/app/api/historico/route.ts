import { NextResponse } from "next/server";
import { getHistorico } from "@/lib/historico";
import { QTD_HIST } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(
    searchParams.get("limit") ?? QTD_HIST.toString(),
    10
  );
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const beforeParam = searchParams.get("before");
  const before = beforeParam ? parseInt(beforeParam, 10) : undefined;
  const draws = await getHistorico(limit, offset, before);
  return NextResponse.json(draws);
}
