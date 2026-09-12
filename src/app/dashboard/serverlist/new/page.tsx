import ServerForm from "@/components/ServerForm";

export default function NewServerPage({
  searchParams,
}: {
  searchParams: { guildId?: string; name?: string; icon?: string };
}) {
  const hasPrefill = !!searchParams.guildId;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Lister un serveur</h1>
      <p className="mt-1 max-w-xl text-mist">
        Ton serveur sera visible publiquement dans l&apos;annuaire une fois validé par l&apos;équipe Relay.
      </p>
      <div className="mt-8">
        <ServerForm
          mode="create"
          initial={
            hasPrefill
              ? {
                  discordId: searchParams.guildId,
                  name: searchParams.name ?? "",
                  icon: searchParams.icon ?? null,
                  shortDesc: "",
                  longDesc: "",
                  inviteUrl: "",
                  tags: "",
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
