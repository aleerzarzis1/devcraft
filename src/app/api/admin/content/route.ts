import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { readSiteContent, writeSiteContent } from "@/lib/siteContent";

export const runtime = "nodejs";

async function isAuthorized() {
  const jar = await cookies();
  return Boolean(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Session expirée ou non connecté. Reconnectez-vous." },
      { status: 401 },
    );
  }

  try {
    const content = await readSiteContent();
    return NextResponse.json({ ok: true, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lecture impossible.";
    return NextResponse.json({ error: "READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Session expirée ou non connecté. Reconnectez-vous." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY", message: "Corps de requête invalide." }, { status: 400 });
  }

  try {
    const next = await writeSiteContent(body as Awaited<ReturnType<typeof readSiteContent>>);
    return NextResponse.json({ ok: true, content: next });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enregistrement impossible.";
    return NextResponse.json({ error: "WRITE_FAILED", message }, { status: 500 });
  }
}

