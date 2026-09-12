"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { guildIconUrl, buildInviteUrl } from "@/lib/discord";
import type { DiscordGuild } from "@/lib/discord";

type ManagedInfo = { botAdded: boolean } | null;

export default function ServerCard({
  guild,
  managed,
  onVerified,
}: {
  guild: DiscordGuild;
  managed?: ManagedInfo;
  onVerified?: (guildId: string) => void;
}) {
  const icon = guildIconUrl(guild.id, guild.icon);
  const botClientId = process.env.NEXT_PUBLIC_DISCORD_BOT_ID;
  const permissions = process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS ?? "8";
  const inviteUrl = botClientId ? buildInviteUrl(botClientId, permissions, guild.id) : "#";
  const listParams = new URLSearchParams({ guildId: guild.id, name: guild.name });
  if (guild.icon) listParams.set("icon", guild.icon);

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const isAdded = managed?.botAdded || justAdded;

  async function verify() {
    setVerifying(true);
    setError(null);
    const res = await fetch(`/api/discord/guilds/${guild.id}/verify`, { method: "POST" });
    const data = await res.json();
    setVerifying(false);
    if (!res.ok) {
      setError(data.error ?? "Le bot n'a pas été détecté. Ajoute-le puis réessaie.");
      return;
    }
    setJustAdded(true);
    onVerified?.(guild.id);
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? (
            <img src={icon} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full bg-panel2 text-sm font-medium text-mist">
              {guild.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{guild.name}</p>
            <p className="text-xs text-mist">{guild.owner ? "Propriétaire" : "Gestion autorisée"}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/dashboard/serverlist/new?${listParams.toString()}`}
            className="focus-ring rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-mist hover:border-signal/60 hover:text-paper"
          >
            Lister à l&apos;annuaire
          </Link>

          {isAdded ? (
            <Link
              href={`/dashboard/manage/${guild.id}`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-good/15 px-3.5 py-2 text-sm font-medium text-good hover:opacity-80"
            >
              <CheckCircle2 size={15} /> Gérer le bot
            </Link>
          ) : (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-lg bg-signal px-3.5 py-2 text-sm font-medium text-white hover:bg-signal2"
            >
              Ajouter le bot
            </a>
          )}
        </div>
      </div>

      {!isAdded && (
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <p className="text-xs text-mist">Déjà ajouté ? Vérifie pour débloquer la gestion du serveur.</p>
          <button
            onClick={verify}
            disabled={verifying}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-mist hover:border-signal/60 hover:text-paper disabled:opacity-60"
          >
            {verifying && <Loader2 size={13} className="animate-spin" />}
            Vérifier l&apos;ajout
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
