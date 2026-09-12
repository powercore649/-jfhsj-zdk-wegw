"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-signal text-lg font-semibold text-white">
          R
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold">Connexion à Relay</h1>
        <p className="mt-2 text-sm text-mist">
          Connecte-toi avec Discord pour gérer tes serveurs et tes bots.
        </p>
        <button
          onClick={() => signIn("discord", { callbackUrl })}
          className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Continuer avec Discord
        </button>
        <p className="mt-4 text-xs text-mist">
          En continuant, tu acceptes que Relay lise ton identifiant Discord et la liste de tes serveurs.
        </p>
      </div>
    </div>
  );
}
