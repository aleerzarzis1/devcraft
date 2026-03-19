import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "INVALID_JSON_BODY" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MISSING_ANTHROPIC_API_KEY", message: "Configure ANTHROPIC_API_KEY dans Vercel (.env.local en local)." },
      { status: 500 },
    );
  }

  const upstreamRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  // Retourne la réponse JSON telle quelle (ou un fallback non-JSON).
  try {
    const data = await upstreamRes.json();
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch {
    const text = await upstreamRes.text();
    return NextResponse.json(
      { error: "UPSTREAM_NON_JSON_RESPONSE", status: upstreamRes.status, message: text },
      { status: 502 },
    );
  }
}

