import { NextRequest, NextResponse } from "next/server";

// ============================================================
//  Chequeo best-effort: ¿la cuenta de Instagram es pública o privada?
//  Instagram NO tiene API oficial para esto sin login, así que usamos
//  el endpoint interno web_profile_info (el que usa la web de IG).
//  Puede fallar/bloquearse (sobre todo desde IPs de datacenter) → en ese
//  caso devolvemos "unknown" y el front deja comprar igual.
// ============================================================

export const runtime = "nodejs";

type Status = "public" | "private" | "not_found" | "unknown";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u") ?? "";
  // Sanitizamos: sacamos @, espacios y dejamos solo chars válidos de IG.
  const username = raw
    .trim()
    .replace(/^@+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();

  if (!username || !/^[a-z0-9._]{1,30}$/.test(username)) {
    return NextResponse.json({ status: "unknown" as Status });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
        username
      )}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "x-ig-app-id": "936619743392459",
          Accept: "*/*",
          "Accept-Language": "es-AR,es;q=0.9",
        },
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (res.status === 404) {
      return NextResponse.json({ status: "not_found" as Status });
    }
    if (!res.ok) {
      return NextResponse.json({ status: "unknown" as Status });
    }

    const data = await res.json();
    const user = data?.data?.user;
    if (!user) {
      return NextResponse.json({ status: "unknown" as Status });
    }
    return NextResponse.json({
      status: (user.is_private ? "private" : "public") as Status,
      followers: user.edge_followed_by?.count ?? null,
    });
  } catch {
    return NextResponse.json({ status: "unknown" as Status });
  }
}
