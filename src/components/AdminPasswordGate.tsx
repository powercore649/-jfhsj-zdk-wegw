"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminPasswordGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Le cookie vient d'être posé par le serveur : on rafraîchit pour que la
    // page admin (server component) le voie et affiche la vraie liste.
    router.refresh();
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-line bg-panel p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-panel2">
        <Lock size={20} className="text-mist" />
      </div>
      <h1 className="mt-4 font-display text-xl font-semibold">Accès administrateur</h1>
      <p className="mt-1 text-sm text-mist">Entre le mot de passe pour accéder à cette page.</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="focus-ring rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-sm text-paper placeholder:text-mist"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="focus-ring rounded-lg bg-signal px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-signal2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Vérification..." : "Déverrouiller"}
        </button>
      </form>
    </div>
  );
}
