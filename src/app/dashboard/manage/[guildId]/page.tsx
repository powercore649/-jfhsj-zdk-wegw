import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGuildTextChannels, fetchGuildRoles, guildIconUrl } from "@/lib/discord";
import ManagedGuildForm from "@/components/ManagedGuildForm";

export default async function ManageGuildPage({ params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/dashboard/manage/${params.guildId}`);

  const guild = await prisma.managedGuild.findUnique({ where: { discordId: params.guildId } });
  if (!guild) notFound();
  if (guild.ownerId !== (session as any).userId) redirect("/dashboard/servers");
  if (!guild.botAdded) redirect("/dashboard/servers");

  const [channels, roles, listing] = await Promise.all([
    fetchGuildTextChannels(guild.discordId),
    fetchGuildRoles(guild.discordId),
    prisma.server.findUnique({ where: { discordId: guild.discordId } }),
  ]);

  const icon = guildIconUrl(guild.discordId, guild.icon);

  return (
    <div>
      <div className="flex items-center gap-4">
        {icon ? (
          <img src={icon} alt="" className="h-14 w-14 rounded-2xl" />
        ) : (
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-panel2 font-display text-lg font-semibold text-mist">
            {guild.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold">{guild.name}</h1>
          <p className="text-sm text-mist">
            Bot vérifié · {guild.memberCount.toLocaleString("fr-FR")} membres
            {guild.lastSyncedAt && ` · synchronisé ${new Date(guild.lastSyncedAt).toLocaleString("fr-FR")}`}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {listing ? (
          <Link href={`/servers/${listing.id}`} className="text-sm text-signal2 hover:underline">
            Voir l&apos;annonce publique de ce serveur →
          </Link>
        ) : (
          <Link
            href={`/dashboard/serverlist/new?guildId=${guild.discordId}&name=${encodeURIComponent(guild.name)}${guild.icon ? `&icon=${guild.icon}` : ""}`}
            className="text-sm text-signal2 hover:underline"
          >
            Ce serveur n&apos;est pas encore listé dans l&apos;annuaire public — le lister →
          </Link>
        )}
      </div>

      <div className="mt-8 max-w-xl">
        <ManagedGuildForm
          guildId={guild.discordId}
          initial={{
            prefix: guild.prefix,
            welcomeChannelId: guild.welcomeChannelId,
            welcomeMessage: guild.welcomeMessage,
            autoRoleId: guild.autoRoleId,
          }}
          channels={channels.map((c) => ({ id: c.id, name: c.name }))}
          roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          hasListing={!!listing}
        />
      </div>
    </div>
  );
}
