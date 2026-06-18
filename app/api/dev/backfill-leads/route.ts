import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/db";
import { markLeadCustomer, markLeadOrdered, listLeads } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Carga en la tabla `leads` los emails de las ordenes ya existentes.
// Uso: /api/dev/backfill-leads?key=TOPVIRAL-TEST-2026
const TOKEN = "TOPVIRAL-TEST-2026";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const orders = await listOrders();
  let customers = 0;
  let leads = 0;
  for (const o of orders) {
    if (!o.contact?.includes("@")) continue;
    const paid = ["paid", "delivering", "delivered"].includes(o.status);
    try {
      if (paid) {
        await markLeadCustomer(o.contact);
        customers++;
      } else {
        await markLeadOrdered(o.contact, o.service, o.locale);
        leads++;
      }
    } catch {
      /* seguir */
    }
  }

  const total = (await listLeads()).length;
  return NextResponse.json({
    ordenes: orders.length,
    backfill_customers: customers,
    backfill_leads: leads,
    total_leads_ahora: total,
  });
}
