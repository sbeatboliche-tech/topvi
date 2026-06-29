import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDailyStats } from "@/lib/visits";

export async function GET(req: NextRequest) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const stats = await getDailyStats(Math.min(days, 365));
  return NextResponse.json({ stats });
}
