// lib/adminAuth.ts — Protection par mot de passe de /dashboard/admin.
//
// Deux couches indépendantes protègent la page :
//   1) session.isAdmin (compte Discord marqué admin en base — voir scripts/make-admin.ts)
//   2) ADMIN_PASSWORD (mot de passe partagé, déjà configuré sur Vercel)
// Les deux sont nécessaires. Le mot de passe déverrouille un cookie signé et
// à durée de vie limitée (12h) — inutile de le retaper à chaque page vue.
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_pwd";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET n'est pas défini.");
  return secret;
}

/** Comparaison en temps constant pour éviter les attaques par timing. */
export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Génère un jeton signé "expiration.signature" à poser en cookie HttpOnly. */
export function createAdminToken(): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = String(expires);
  const sig = crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Vérifie la signature ET l'expiration du jeton lu depuis le cookie. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expectedSig = crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}
