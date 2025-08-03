import { NextResponse } from "next/server";
import { saveGenerated, getGenerated } from "@/lib/generated";

export async function GET() {
  const data = await getGenerated();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { numbers } = await req.json();
  if (!Array.isArray(numbers)) {
    return NextResponse.json({ error: "numbers required" }, { status: 400 });
  }
  await saveGenerated(numbers);
  return NextResponse.json({ ok: true });
}
