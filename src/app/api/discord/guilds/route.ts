import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUserGuilds, canManageGuild } from "@/lib/discord";

// Returns the servers the logged-in user can manage (used to power
// "add bot to server" and the servers dashboard).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const accessToken = (session as any).accessToken as string | undefined;
  if (!accessToken) return NextResponse.json([]);

  const guilds = await fetchUserGuilds(accessToken);
  const manageable = guilds.filter((g) => g.owner || canManageGuild(g.permissions));

  return NextResponse.json(manageable);
}
