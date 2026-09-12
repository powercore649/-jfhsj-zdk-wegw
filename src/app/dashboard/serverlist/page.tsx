import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = {
  APPROVED: "text-good",
  PENDING: "text-ember",
  REJECTED: "text-red-400",
};

const statusLabels: Record<string, string> = {
  APPROVED: "Approuvé",
  PENDING: "En attente",
  REJECTED: "Refusé",
};

export default async function MyServerListingsPage() {
  const session = await getServerSession(authOptions);
  const servers = await prisma.server.findMany({
    where: { ownerId: (session as any).userId },
    include: { _count: { select: { votes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Mes serveurs listés</h1>
        <Link href="/dashboard/serverlist/new" className="focus-ring rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal2">
          + Lister un serveur
        </Link>
      </div>
      <p className="mt-1 text-mist">
        Serveurs que tu as soumis à l&apos;annuaire public. Pour inviter le bot sur l&apos;un de tes
        serveurs, va plutôt dans <Link href="/dashboard/servers" className="text-signal2 hover:underline">Mes serveurs</Link>.
      </p>

      {servers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-mist">
          Tu n&apos;as encore listé aucun serveur sur Relay.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-panel">
          {servers.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className={`text-xs ${statusStyles[s.status]}`}>{statusLabels[s.status]} · {s._count.votes} votes</p>
              </div>
              <Link href={`/dashboard/serverlist/${s.id}/edit`} className="text-sm text-signal2 hover:underline">
                Gérer →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
