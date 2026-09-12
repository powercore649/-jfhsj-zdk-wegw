import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { Star } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { botAvatarUrl, guildIconUrl } from "@/lib/discord";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminAuth";
import AdminBotActions from "@/components/AdminBotActions";
import AdminServerActions from "@/components/AdminServerActions";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import AdminLockButton from "@/components/AdminLockButton";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard/admin");
  if (!(session as any).isAdmin) redirect("/dashboard");

  // Seconde barrière : même un compte marqué admin doit déverrouiller la page
  // avec ADMIN_PASSWORD (cookie signé, valable 12h).
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminToken(token)) {
    return <AdminPasswordGate />;
  }

  const type = searchParams.type === "servers" ? "servers" : "bots";

  const filter = searchParams.status?.toUpperCase();
  const validFilter = filter === "APPROVED" || filter === "PENDING" || filter === "REJECTED" ? filter : undefined;

  const [bots, pendingBotCount, servers, pendingServerCount] = await Promise.all([
    prisma.bot.findMany({
      where: validFilter ? { status: validFilter as any } : undefined,
      include: { _count: { select: { votes: true } }, owner: { select: { username: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.bot.count({ where: { status: "PENDING" } }),
    prisma.server.findMany({
      where: validFilter ? { status: validFilter as any } : undefined,
      include: { _count: { select: { votes: true } }, owner: { select: { username: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.server.count({ where: { status: "PENDING" } }),
  ]);

  const tabs: { key?: string; label: string }[] = [
    { key: undefined, label: "Tous" },
    { key: "PENDING", label: `En attente${(type === "bots" ? pendingBotCount : pendingServerCount) ? ` (${type === "bots" ? pendingBotCount : pendingServerCount})` : ""}` },
    { key: "APPROVED", label: "Approuvés" },
    { key: "REJECTED", label: "Refusés" },
  ];

  const typeHref = (t: string) => `/dashboard/admin?type=${t}${validFilter ? `&status=${validFilter.toLowerCase()}` : ""}`;
  const statusHref = (key?: string) =>
    `/dashboard/admin?type=${type}${key ? `&status=${key.toLowerCase()}` : ""}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Administration</h1>
        <AdminLockButton />
      </div>

      <div className="mt-4 flex gap-1">
        <Link
          href={typeHref("bots")}
          className={`focus-ring rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            type === "bots" ? "bg-signal text-white" : "border border-line text-mist hover:text-paper"
          }`}
        >
          Bots{pendingBotCount ? ` (${pendingBotCount})` : ""}
        </Link>
        <Link
          href={typeHref("servers")}
          className={`focus-ring rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            type === "servers" ? "bg-signal text-white" : "border border-line text-mist hover:text-paper"
          }`}
        >
          Serveurs{pendingServerCount ? ` (${pendingServerCount})` : ""}
        </Link>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = validFilter === t.key || (!validFilter && !t.key);
          return (
            <Link
              key={t.label}
              href={statusHref(t.key)}
              className={`focus-ring shrink-0 rounded-lg px-3.5 py-2 text-sm transition-colors ${
                active ? "bg-panel2 text-paper" : "text-mist hover:bg-panel hover:text-paper"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {type === "bots" ? (
        bots.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-mist">
            Aucun bot dans cette catégorie.
          </div>
        ) : (
          <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-panel">
            {bots.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={botAvatarUrl(b.discordId, b.avatar)} alt="" className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/bots/${b.id}`} className="truncate font-medium hover:underline">
                        {b.name}
                      </Link>
                      {b.featured && <Star size={13} className="shrink-0 text-signal2" fill="currentColor" />}
                    </div>
                    <p className={`text-xs ${statusStyles[b.status]}`}>
                      {statusLabels[b.status]} · {b._count.votes} votes · par {b.owner.username}
                    </p>
                  </div>
                </div>
                <AdminBotActions botId={b.id} status={b.status as any} featured={b.featured} />
              </div>
            ))}
          </div>
        )
      ) : servers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-mist">
          Aucun serveur dans cette catégorie.
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-panel">
          {servers.map((s) => {
            const icon = guildIconUrl(s.discordId, s.icon);
            return (
              <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  {icon ? (
                    <img src={icon} alt="" className="h-10 w-10 shrink-0 rounded-full" />
                  ) : (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel2 text-xs font-medium text-mist">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/servers/${s.id}`} className="truncate font-medium hover:underline">
                        {s.name}
                      </Link>
                      {s.featured && <Star size={13} className="shrink-0 text-signal2" fill="currentColor" />}
                    </div>
                    <p className={`text-xs ${statusStyles[s.status]}`}>
                      {statusLabels[s.status]} · {s._count.votes} votes · par {s.owner.username}
                    </p>
                  </div>
                </div>
                <AdminServerActions serverId={s.id} status={s.status as any} featured={s.featured} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
