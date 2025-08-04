import { NextResponse } from "next/server";
import { analyzeHistorico } from "@/lib/historico";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beforeParam = searchParams.get("before");
  const before = beforeParam ? parseInt(beforeParam, 10) : undefined;
  const features = await analyzeHistorico(before);
  return NextResponse.json(features);
}
