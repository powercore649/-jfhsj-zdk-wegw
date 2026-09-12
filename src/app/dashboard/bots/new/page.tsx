import BotForm from "@/components/BotForm";

export default function NewBotPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Ajouter un bot</h1>
      <p className="mt-1 max-w-xl text-mist">
        Ton bot sera visible publiquement une fois validé par l&apos;équipe Relay.
      </p>
      <div className="mt-8">
        <BotForm mode="create" />
      </div>
    </div>
  );
}
