import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { botAvatarUrl } from "@/lib/discord";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: (session as any).userId } });
  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
      <p className="mt-1 text-mist">Informations liées à ton compte Discord.</p>

      <div className="mt-8 max-w-lg rounded-2xl border border-line bg-panel p-6">
        <div className="flex items-center gap-4">
          <img src={botAvatarUrl(user.discordId, user.avatar)} alt="" className="h-14 w-14 rounded-full" />
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-mist">ID Discord : {user.discordId}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-mist">Email</dt>
            <dd>{user.email ?? "Non communiqué"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Membre depuis</dt>
            <dd>{user.createdAt.toLocaleDateString("fr-FR")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Rôle</dt>
            <dd>{user.isAdmin ? "Administrateur" : "Membre"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
