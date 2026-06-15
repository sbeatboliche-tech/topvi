import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db";
import { hasClaimedTrial, markTrialClaimed } from "@/lib/trials";

const TRIAL_QUANTITY = 10;
const TRIAL_SERVICE = "instagram-likes";

function isValidInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "www.instagram.com" || u.hostname === "instagram.com") &&
      u.pathname.includes("/p/")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postUrl, contact, deviceToken } = await req.json();

    if (!postUrl || !isValidInstagramUrl(String(postUrl))) {
      return NextResponse.json(
        { error: "Ingresá un link válido de una publicación de Instagram (ej: https://www.instagram.com/p/...)" },
        { status: 400 }
      );
    }

    // Check by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";

    const ipKey = `ip:${ip}`;
    const deviceKey = deviceToken ? `device:${String(deviceToken).slice(0, 64)}` : null;

    const [ipUsed, deviceUsed] = await Promise.all([
      hasClaimedTrial(ipKey),
      deviceKey ? hasClaimedTrial(deviceKey) : Promise.resolve(false),
    ]);

    if (ipUsed || deviceUsed) {
      return NextResponse.json(
        { error: "Ya usaste tu prueba gratuita. ¡Comprá un paquete para conseguir más likes!" },
        { status: 409 }
      );
    }

    // Create the trial order
    const order = await createOrder({
      locale: "ar",
      service: TRIAL_SERVICE,
      username: new URL(postUrl).pathname, // store the post path as username
      contact: String(contact || "trial").slice(0, 120),
      quantity: TRIAL_QUANTITY,
      bonus: 0,
      quality: "global",
      totalFollowers: TRIAL_QUANTITY,
      amount: 0,
      payment: "trial" as "usdt", // hack: "trial" isn't in the union but db accepts it
    });

    // Mark both keys as claimed
    await Promise.all([
      markTrialClaimed(ipKey),
      deviceKey ? markTrialClaimed(deviceKey) : Promise.resolve(),
    ]);

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[trial/claim]", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
