import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bot, Server, Star } from "lucide-react";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const userId = (session as any).userId as string;

  const [bots, servers] = await Promise.all([
    prisma.bot.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { votes: true } } },
    }),
    prisma.server.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { votes: true } } },
    }),
  ]);

  const totalVotes =
    bots.reduce((sum, b) => sum + b._count.votes, 0) + servers.reduce((sum, s) => sum + s._count.votes, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">
        Salut {session?.user?.name} 👋
      </h1>
      <p className="mt-1 text-mist">Voici un aperçu de ton activité sur Relay.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card icon={<Bot size={17} />} label="Bots soumis" value={bots.length} />
        <Card icon={<Server size={17} />} label="Serveurs listés" value={servers.length} />
        <Card icon={<Star size={17} />} label="Votes reçus" value={totalVotes} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Tes bots</h2>
        <Link href="/dashboard/bots/new" className="text-sm text-signal2 hover:underline">
          + Ajouter un bot
        </Link>
      </div>

      {bots.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-mist">
          Tu n&apos;as encore soumis aucun bot.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
          {bots.map((b) => (
            <Link key={b.id} href={`/dashboard/bots/${b.id}/edit`} className="flex items-center justify-between px-5 py-4 hover:bg-panel2">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-mist">{b.status === "APPROVED" ? "Approuvé" : b.status === "PENDING" ? "En attente de validation" : "Refusé"}</p>
              </div>
              <span className="text-sm text-mist">Gérer →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-center gap-2 text-mist">{icon} <span className="text-xs">{label}</span></div>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
