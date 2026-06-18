import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listVisitors } from "@/lib/visits";

export async function GET() {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ visitors: await listVisitors() });
}
