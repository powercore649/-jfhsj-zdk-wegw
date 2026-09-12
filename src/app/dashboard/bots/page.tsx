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

export default async function MyBotsPage() {
  const session = await getServerSession(authOptions);
  const bots = await prisma.bot.findMany({
    where: { ownerId: (session as any).userId },
    include: { _count: { select: { votes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Mes bots</h1>
        <Link href="/dashboard/bots/new" className="focus-ring rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal2">
          + Ajouter un bot
        </Link>
      </div>

      {bots.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-mist">
          Tu n&apos;as pas encore de bot listé sur Relay.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-panel">
          {bots.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className={`text-xs ${statusStyles[b.status]}`}>{statusLabels[b.status]} · {b._count.votes} votes</p>
              </div>
              <Link href={`/dashboard/bots/${b.id}/edit`} className="text-sm text-signal2 hover:underline">
                Gérer →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
