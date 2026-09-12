import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchBotGuild } from "@/lib/discord";

// POST /api/managed-guilds/[guildId]/sync
// Recontacte Discord avec le token du bot pour rafraîchir le nombre de
// membres réel, et met à jour l'annonce publique du serveur si elle existe
// (au lieu de laisser l'utilisateur saisir un chiffre à la main).
export async function POST(_req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const guild = await prisma.managedGuild.findUnique({ where: { discordId: params.guildId } });
  if (!guild || guild.ownerId !== (session as any).userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!guild.botAdded) {
    return NextResponse.json({ error: "Le bot n'est plus vérifié sur ce serveur." }, { status: 409 });
  }

  const botGuild = await fetchBotGuild(params.guildId);
  if (!botGuild) {
    // Le bot a peut-être été retiré du serveur depuis.
    await prisma.managedGuild.update({ where: { discordId: params.guildId }, data: { botAdded: false } });
    return NextResponse.json(
      { error: "Le bot ne semble plus présent sur ce serveur. Réajoute-le puis reviens ici." },
      { status: 404 }
    );
  }

  const memberCount = botGuild.approximate_member_count ?? guild.memberCount;

  const [updated] = await prisma.$transaction([
    prisma.managedGuild.update({
      where: { discordId: params.guildId },
      data: { memberCount, name: botGuild.name, icon: botGuild.icon, lastSyncedAt: new Date() },
    }),
    prisma.server.updateMany({
      where: { discordId: params.guildId },
      data: { memberCount },
    }),
  ]);

  return NextResponse.json(updated);
}
