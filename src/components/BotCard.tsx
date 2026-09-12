import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { botAvatarUrl } from "@/lib/discord";
import type { BotWithCounts } from "@/types";

export default function BotCard({ bot, large = false }: { bot: BotWithCounts; large?: boolean }) {
  return (
    <Link
      href={`/bots/${bot.id}`}
      className={`focus-ring group flex flex-col rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-signal/60 hover:bg-panel2 ${
        large ? "md:flex-row md:items-center md:gap-6 md:p-7" : ""
      }`}
    >
      <div className={`flex items-start gap-4 ${large ? "md:w-full" : ""}`}>
        <img
          src={botAvatarUrl(bot.discordId, bot.avatar)}
          alt=""
          className={`rounded-xl ${large ? "h-16 w-16" : "h-12 w-12"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`truncate font-display font-semibold ${large ? "text-xl" : "text-base"}`}>
              {bot.name}
            </h3>
            <ArrowUpRight size={15} className="shrink-0 text-mist opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-mist">{bot.shortDesc}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {bot.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-4 text-sm text-mist ${large ? "md:mt-0 md:shrink-0" : ""}`}>
        <span className="flex items-center gap-1.5 text-ember">
          <Star size={14} fill="currentColor" /> {bot._count?.votes ?? 0}
        </span>
        <span>{bot.serverCount.toLocaleString("fr-FR")} serveurs</span>
      </div>
    </Link>
  );
}
