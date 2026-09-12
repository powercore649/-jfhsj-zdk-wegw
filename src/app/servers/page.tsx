import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ServerListingCard from "@/components/ServerListingCard";
import { Search } from "lucide-react";

const POPULAR_TAGS = ["Gaming", "Communauté", "Fun", "Musique", "Art", "IA", "Rôle-play"];

export default async function ServersPage({
  searchParams,
}: {
  searchParams: { query?: string; tag?: string; sort?: string };
}) {
  const query = searchParams.query?.trim();
  const tag = searchParams.tag?.trim();
  const sort = searchParams.sort === "new" ? "new" : "votes";

  const servers = await prisma.server.findMany({
    where: {
      status: "APPROVED",
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { shortDesc: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: { _count: { select: { votes: true } } },
  });

  servers.sort((a, b) =>
    sort === "new" ? b.createdAt.getTime() - a.createdAt.getTime() : b._count.votes - a._count.votes
  );

  const [serverCount, memberCountAgg, votesToday] = await Promise.all([
    prisma.server.count({ where: { status: "APPROVED" } }),
    prisma.server.aggregate({ where: { status: "APPROVED" }, _sum: { memberCount: true } }),
    prisma.serverVote.count({ where: { createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  const featured = servers.find((s) => s.featured) ?? servers[0];
  const rest = servers.filter((s) => s.id !== featured?.id);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line/70">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] md:text-5xl">
              La bonne communauté,
              <br />
              pour tes centres d&apos;intérêt.
            </h1>
            <p className="mt-5 max-w-md text-mist">
              Relay référence aussi des serveurs Discord vérifiés, classés par votes réels.
              Trouve une communauté et rejoins-la en un clic.
            </p>

            <form action="/servers" className="mt-8 flex max-w-md items-center gap-2 rounded-xl border border-line bg-panel p-1.5">
              <Search size={17} className="ml-2 shrink-0 text-mist" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Rechercher un serveur…"
                className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-mist"
              />
              <button className="focus-ring shrink-0 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal2">
                Chercher
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {POPULAR_TAGS.map((t) => (
                <Link key={t} href={`/servers?tag=${encodeURIComponent(t)}`} className="tag-pill hover:border-signal/60 hover:text-paper">
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <p className="font-display text-xs uppercase tracking-wide text-mist">En direct</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat label="Serveurs listés" value={serverCount} />
              <Stat label="Membres cumulés" value={memberCountAgg._sum.memberCount ?? 0} />
              <Stat label="Votes / 24h" value={votesToday} />
            </div>
            <div className="mt-6 rounded-xl border border-line bg-ink p-4 font-mono text-[13px] text-mist">
              <p><span className="text-good">✓</span> connexion à l&apos;API Discord établie</p>
              <p className="mt-1"><span className="text-good">✓</span> {serverCount} serveurs synchronisés</p>
              <p className="mt-1 text-signal2">→ prêt à rejoindre une communauté</p>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {query ? `Résultats pour "${query}"` : tag ? `Tag : ${tag}` : "Serveurs recommandés"}
          </h2>
          <div className="flex gap-2 text-sm">
            <Link href={`/servers?${tag ? `tag=${tag}&` : ""}sort=votes`} className={`tag-pill ${sort === "votes" ? "border-signal text-paper" : ""}`}>Populaires</Link>
            <Link href={`/servers?${tag ? `tag=${tag}&` : ""}sort=new`} className={`tag-pill ${sort === "new" ? "border-signal text-paper" : ""}`}>Nouveautés</Link>
          </div>
        </div>

        {servers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center text-mist">
            <p>Aucun serveur ne correspond à ta recherche pour l&apos;instant.</p>
            <Link href="/dashboard/serverlist/new" className="mt-3 inline-block text-signal2 hover:underline">
              Lister le premier serveur →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {featured && <ServerListingCard server={JSON.parse(JSON.stringify(featured))} large />}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((s) => (
                <ServerListingCard key={s.id} server={JSON.parse(JSON.stringify(s))} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold">{value.toLocaleString("fr-FR")}</p>
      <p className="text-xs text-mist">{label}</p>
    </div>
  );
}
