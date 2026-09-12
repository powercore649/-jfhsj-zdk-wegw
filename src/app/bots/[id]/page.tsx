import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { botAvatarUrl, buildInviteUrl } from "@/lib/discord";
import VoteButton from "@/components/VoteButton";
import { Globe, LifeBuoy, Github } from "lucide-react";

export default async function BotPage({ params }: { params: { id: string } }) {
  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    include: { _count: { select: { votes: true } }, owner: { select: { username: true } } },
  });

  if (!bot || bot.status !== "APPROVED") notFound();

  const inviteUrl = buildInviteUrl(bot.discordId, process.env.DISCORD_BOT_PERMISSIONS ?? "8");

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start gap-5">
            <img src={botAvatarUrl(bot.discordId, bot.avatar)} alt="" className="h-20 w-20 rounded-2xl" />
            <div>
              <h1 className="font-display text-2xl font-semibold md:text-3xl">{bot.name}</h1>
              <p className="mt-1 text-mist">{bot.shortDesc}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bot.tags.map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-line text-[15px] leading-relaxed text-mist">
            {bot.longDesc}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring block w-full rounded-lg bg-signal px-4 py-3 text-center text-sm font-semibold text-white hover:bg-signal2"
            >
              Ajouter à un serveur
            </a>
            <div className="mt-3">
              <VoteButton botId={bot.id} initialVotes={bot._count.votes} />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-mist">Préfixe</dt><dd>{bot.prefix}</dd></div>
              <div className="flex justify-between"><dt className="text-mist">Serveurs</dt><dd>{bot.serverCount.toLocaleString("fr-FR")}</dd></div>
              <div className="flex justify-between"><dt className="text-mist">Ajouté par</dt><dd>{bot.owner.username}</dd></div>
            </dl>
          </div>

          {(bot.website || bot.supportUrl || bot.githubUrl) && (
            <div className="rounded-2xl border border-line bg-panel p-5 text-sm">
              <p className="mb-3 font-medium">Liens</p>
              <div className="space-y-2 text-mist">
                {bot.website && <LinkRow href={bot.website} icon={<Globe size={15} />} label="Site web" />}
                {bot.supportUrl && <LinkRow href={bot.supportUrl} icon={<LifeBuoy size={15} />} label="Support" />}
                {bot.githubUrl && <LinkRow href={bot.githubUrl} icon={<Github size={15} />} label="Code source" />}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function LinkRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-paper">
      {icon} {label}
    </a>
  );
}
