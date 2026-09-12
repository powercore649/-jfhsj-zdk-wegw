import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guildIconUrl } from "@/lib/discord";
import ServerVoteButton from "@/components/ServerVoteButton";
import { Users } from "lucide-react";

export default async function ServerPage({ params }: { params: { id: string } }) {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { _count: { select: { votes: true } }, owner: { select: { username: true } } },
  });

  if (!server || server.status !== "APPROVED") notFound();

  const icon = guildIconUrl(server.discordId, server.icon);

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start gap-5">
            {icon ? (
              <img src={icon} alt="" className="h-20 w-20 rounded-2xl" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-panel2 font-display text-2xl font-semibold text-mist">
                {server.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-semibold md:text-3xl">{server.name}</h1>
              <p className="mt-1 text-mist">{server.shortDesc}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {server.tags.map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="prose prose-invert mt-8 max-w-none whitespace-pre-line text-[15px] leading-relaxed text-mist">
            {server.longDesc}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <a
              href={server.inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring block w-full rounded-lg bg-signal px-4 py-3 text-center text-sm font-semibold text-white hover:bg-signal2"
            >
              Rejoindre le serveur
            </a>
            <div className="mt-3">
              <ServerVoteButton serverId={server.id} initialVotes={server._count.votes} />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-mist"><Users size={14} /> Membres</dt>
                <dd>{server.memberCount.toLocaleString("fr-FR")}</dd>
              </div>
              <div className="flex justify-between"><dt className="text-mist">Listé par</dt><dd>{server.owner.username}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
