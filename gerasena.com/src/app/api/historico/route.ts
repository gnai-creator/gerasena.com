import { NextResponse } from "next/server";
import { getCachedHistorico } from "@/lib/historico";
import { QTD_HIST } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? QTD_HIST.toString(), 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const beforeParam = searchParams.get("before");
  const before = beforeParam ? parseInt(beforeParam, 10) : undefined;
  console.log(
    "Fetching historico with limit:",
    limit,
    "offset:",
    offset,
    "before:",
    before
  );
  const draws = await getCachedHistorico(limit, offset, before);
  return NextResponse.json(draws);
}
