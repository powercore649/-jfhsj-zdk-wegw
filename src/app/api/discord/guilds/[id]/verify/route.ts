import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchUserGuilds, canManageGuild, fetchBotGuild } from "@/lib/discord";

// POST /api/discord/guilds/[id]/verify
// Vérifie réellement (via le token du bot) que le bot a été ajouté au
// serveur, puis débloque la page de gestion. C'est ce qui donne un vrai
// sens au bouton "Ajouter le bot" : sans cette vérification, cliquer sur le
// lien d'invitation n'avait aucun effet visible sur le site.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const accessToken = (session as any).accessToken as string | undefined;
  if (!accessToken) return NextResponse.json({ error: "Session Discord expirée, reconnecte-toi." }, { status: 401 });

  // On revérifie que l'utilisateur gère toujours bien ce serveur (pas de triche via l'URL).
  const guilds = await fetchUserGuilds(accessToken);
  const guild = guilds.find((g) => g.id === params.id);
  if (!guild || !(guild.owner || canManageGuild(guild.permissions))) {
    return NextResponse.json({ error: "Tu ne gères pas ce serveur." }, { status: 403 });
  }

  if (!process.env.DISCORD_BOT_TOKEN) {
    return NextResponse.json(
      { error: "La vérification du bot n'est pas configurée (DISCORD_BOT_TOKEN manquant côté serveur)." },
      { status: 501 }
    );
  }

  const botGuild = await fetchBotGuild(params.id);
  if (!botGuild) {
    return NextResponse.json(
      { error: "Le bot n'a pas été détecté sur ce serveur. Ajoute-le d'abord, puis réessaie." },
      { status: 404 }
    );
  }

  const managed = await prisma.managedGuild.upsert({
    where: { discordId: params.id },
    update: {
      name: botGuild.name,
      icon: botGuild.icon,
      botAdded: true,
      memberCount: botGuild.approximate_member_count ?? 0,
      lastSyncedAt: new Date(),
      ownerId: (session as any).userId,
    },
    create: {
      discordId: params.id,
      name: botGuild.name,
      icon: botGuild.icon,
      botAdded: true,
      memberCount: botGuild.approximate_member_count ?? 0,
      lastSyncedAt: new Date(),
      ownerId: (session as any).userId,
    },
  });

  return NextResponse.json(managed);
}
