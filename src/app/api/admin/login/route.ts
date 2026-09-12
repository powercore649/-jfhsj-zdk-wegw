import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyAdminPassword, createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  // On exige d'être déjà connecté ET marqué admin avant même de tenter le mot
  // de passe : ce n'est pas un accès public, c'est une seconde barrière.
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD n'est pas configuré côté serveur." }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h, doit correspondre à TOKEN_TTL_MS dans adminAuth.ts
  });
  return res;
}

/** Verrouille à nouveau l'accès admin (bouton "Verrouiller" côté client). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
