import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { notifyTransferClaimed } from "@/lib/email";

// El cliente avisó "Ya transferí": le mandamos un mail al dueño para verificar.
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json().catch(() => ({}));
    if (id) {
      const order = await getOrder(String(id));
      if (order) await notifyTransferClaimed(order).catch(() => {});
    }
  } catch (err) {
    console.error("[api/orders/transferred]", err);
  }
  return NextResponse.json({ ok: true });
}
