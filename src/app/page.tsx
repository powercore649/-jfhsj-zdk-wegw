import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BotCard from "@/components/BotCard";
import { Search } from "lucide-react";

const POPULAR_TAGS = ["Modération", "Musique", "Fun", "Économie", "Utilitaire", "IA", "Jeux"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { query?: string; tag?: string; sort?: string };
}) {
  const query = searchParams.query?.trim();
  const tag = searchParams.tag?.trim();
  const sort = searchParams.sort === "new" ? "new" : "votes";

  const bots = await prisma.bot.findMany({
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

  bots.sort((a, b) =>
    sort === "new" ? b.createdAt.getTime() - a.createdAt.getTime() : b._count.votes - a._count.votes
  );

  const [botCount, serverCountAgg, votesToday] = await Promise.all([
    prisma.bot.count({ where: { status: "APPROVED" } }),
    prisma.bot.aggregate({ where: { status: "APPROVED" }, _sum: { serverCount: true } }),
    prisma.vote.count({ where: { createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
  ]);

  const featured = bots.find((b) => b.featured) ?? bots[0];
  const rest = bots.filter((b) => b.id !== featured?.id);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line/70">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] md:text-5xl">
              Le bon bot Discord,
              <br />
              pour le bon serveur.
            </h1>
            <p className="mt-5 max-w-md text-mist">
              Relay référence des bots vérifiés, classés par votes réels de communautés.
              Connecte-toi, choisis un serveur, ajoute le bot — sans quitter la page.
            </p>

            <form action="/" className="mt-8 flex max-w-md items-center gap-2 rounded-xl border border-line bg-panel p-1.5">
              <Search size={17} className="ml-2 shrink-0 text-mist" />
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Rechercher un bot…"
                className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-mist"
              />
              <button className="focus-ring shrink-0 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal2">
                Chercher
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {POPULAR_TAGS.map((t) => (
                <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="tag-pill hover:border-signal/60 hover:text-paper">
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6">
            <p className="font-display text-xs uppercase tracking-wide text-mist">En direct</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat label="Bots listés" value={botCount} />
              <Stat label="Serveurs couverts" value={serverCountAgg._sum.serverCount ?? 0} />
              <Stat label="Votes / 24h" value={votesToday} />
            </div>
            <div className="mt-6 rounded-xl border border-line bg-ink p-4 font-mono text-[13px] text-mist">
              <p><span className="text-good">✓</span> connexion à l&apos;API Discord établie</p>
              <p className="mt-1"><span className="text-good">✓</span> {botCount} bots synchronisés</p>
              <p className="mt-1 text-signal2">→ prêt à ajouter un bot à votre serveur</p>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {query ? `Résultats pour "${query}"` : tag ? `Tag : ${tag}` : "Bots recommandés"}
          </h2>
          <div className="flex gap-2 text-sm">
            <Link href={`/?${tag ? `tag=${tag}&` : ""}sort=votes`} className={`tag-pill ${sort === "votes" ? "border-signal text-paper" : ""}`}>Populaires</Link>
            <Link href={`/?${tag ? `tag=${tag}&` : ""}sort=new`} className={`tag-pill ${sort === "new" ? "border-signal text-paper" : ""}`}>Nouveautés</Link>
          </div>
        </div>

        {bots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center text-mist">
            <p>Aucun bot ne correspond à ta recherche pour l&apos;instant.</p>
            <Link href="/dashboard/bots/new" className="mt-3 inline-block text-signal2 hover:underline">
              Soumettre le premier bot →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {featured && <BotCard bot={JSON.parse(JSON.stringify(featured))} large />}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((b) => (
                <BotCard key={b.id} bot={JSON.parse(JSON.stringify(b))} />
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
