import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServerForm from "@/components/ServerForm";

export default async function EditServerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const server = await prisma.server.findUnique({ where: { id: params.id } });
  if (!server) notFound();
  if (server.ownerId !== (session as any).userId && !(session as any).isAdmin) redirect("/dashboard/serverlist");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Gérer {server.name}</h1>
      <p className="mt-1 text-mist">Modifie les informations affichées publiquement.</p>
      <div className="mt-8">
        <ServerForm
          mode="edit"
          serverId={server.id}
          initial={{
            shortDesc: server.shortDesc,
            longDesc: server.longDesc,
            inviteUrl: server.inviteUrl,
            tags: server.tags.join(","),
          }}
        />
      </div>
    </div>
  );
}
