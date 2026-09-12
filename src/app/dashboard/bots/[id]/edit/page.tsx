import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BotForm from "@/components/BotForm";

export default async function EditBotPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const bot = await prisma.bot.findUnique({ where: { id: params.id } });
  if (!bot) notFound();
  if (bot.ownerId !== (session as any).userId && !(session as any).isAdmin) redirect("/dashboard/bots");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Gérer {bot.name}</h1>
      <p className="mt-1 text-mist">Modifie les informations affichées publiquement.</p>
      <div className="mt-8">
        <BotForm
          mode="edit"
          botId={bot.id}
          initial={{
            shortDesc: bot.shortDesc,
            longDesc: bot.longDesc,
            prefix: bot.prefix,
            website: bot.website ?? "",
            supportUrl: bot.supportUrl ?? "",
            githubUrl: bot.githubUrl ?? "",
            tags: bot.tags.join(","),
          }}
        />
      </div>
    </div>
  );
}
