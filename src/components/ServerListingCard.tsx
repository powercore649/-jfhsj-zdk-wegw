import Link from "next/link";
import { ArrowUpRight, Star, Users } from "lucide-react";
import { guildIconUrl } from "@/lib/discord";
import type { ServerWithCounts } from "@/types";

export default function ServerListingCard({ server, large = false }: { server: ServerWithCounts; large?: boolean }) {
  const icon = guildIconUrl(server.discordId, server.icon);

  return (
    <Link
      href={`/servers/${server.id}`}
      className={`focus-ring group flex flex-col rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-signal/60 hover:bg-panel2 ${
        large ? "md:flex-row md:items-center md:gap-6 md:p-7" : ""
      }`}
    >
      <div className={`flex items-start gap-4 ${large ? "md:w-full" : ""}`}>
        {icon ? (
          <img src={icon} alt="" className={`rounded-xl ${large ? "h-16 w-16" : "h-12 w-12"}`} />
        ) : (
          <div
            className={`grid shrink-0 place-items-center rounded-xl bg-panel2 font-display font-semibold text-mist ${
              large ? "h-16 w-16 text-xl" : "h-12 w-12 text-base"
            }`}
          >
            {server.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`truncate font-display font-semibold ${large ? "text-xl" : "text-base"}`}>
              {server.name}
            </h3>
            <ArrowUpRight size={15} className="shrink-0 text-mist opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-mist">{server.shortDesc}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {server.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-4 text-sm text-mist ${large ? "md:mt-0 md:shrink-0" : ""}`}>
        <span className="flex items-center gap-1.5 text-ember">
          <Star size={14} fill="currentColor" /> {server._count?.votes ?? 0}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} /> {server.memberCount.toLocaleString("fr-FR")}
        </span>
      </div>
    </Link>
  );
}
