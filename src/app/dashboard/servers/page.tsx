"use client";

import { useEffect, useState } from "react";
import ServerCard from "@/components/ServerCard";
import type { DiscordGuild } from "@/lib/discord";

type ManagedGuild = { discordId: string; botAdded: boolean };

export default function ServersPage() {
  const [guilds, setGuilds] = useState<DiscordGuild[] | null>(null);
  const [managedMap, setManagedMap] = useState<Record<string, ManagedGuild>>({});

  useEffect(() => {
    fetch("/api/discord/guilds")
      .then((r) => r.json())
      .then(setGuilds)
      .catch(() => setGuilds([]));

    fetch("/api/managed-guilds")
      .then((r) => r.json())
      .then((list: ManagedGuild[]) => {
        const map: Record<string, ManagedGuild> = {};
        for (const g of list) map[g.discordId] = g;
        setManagedMap(map);
      })
      .catch(() => {});
  }, []);

  function markVerified(guildId: string) {
    setManagedMap((prev) => ({ ...prev, [guildId]: { discordId: guildId, botAdded: true } }));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Mes serveurs</h1>
      <p className="mt-1 text-mist">
        Serveurs Discord où tu peux gérer les intégrations. Ajoute le bot puis clique sur « Vérifier
        l&apos;ajout » pour débloquer sa page de gestion (préfixe, message de bienvenue, rôle auto, stats).
      </p>

      <div className="mt-6 space-y-3">
        {guilds === null && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-xl border border-line bg-panel" />
        ))}

        {guilds?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-mist">
            Aucun serveur géré trouvé sur ton compte Discord.
          </div>
        )}

        {guilds?.map((g) => (
          <ServerCard key={g.id} guild={g} managed={managedMap[g.id] ?? null} onVerified={markVerified} />
        ))}
      </div>
    </div>
  );
}
