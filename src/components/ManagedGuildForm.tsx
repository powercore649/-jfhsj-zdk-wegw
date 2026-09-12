"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

type Option = { id: string; name: string };

export default function ManagedGuildForm({
  guildId,
  initial,
  channels,
  roles,
  hasListing,
}: {
  guildId: string;
  initial: {
    prefix: string;
    welcomeChannelId: string | null;
    welcomeMessage: string | null;
    autoRoleId: string | null;
  };
  channels: Option[];
  roles: Option[];
  hasListing: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/managed-guilds/${guildId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Impossible d'enregistrer, vérifie les champs.");
      return;
    }
    setMessage("Paramètres enregistrés.");
    router.refresh();
  }

  async function sync() {
    setSyncing(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/managed-guilds/${guildId}/sync`, { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    if (!res.ok) {
      setError(data.error ?? "La synchronisation a échoué.");
      return;
    }
    setMessage(
      hasListing
        ? `Synchronisé : ${data.memberCount.toLocaleString("fr-FR")} membres (annonce publique mise à jour).`
        : `Synchronisé : ${data.memberCount.toLocaleString("fr-FR")} membres.`
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-line bg-panel p-4">
        <div>
          <p className="text-sm font-medium">Statistiques</p>
          <p className="text-xs text-mist">Récupère le nombre de membres réel depuis Discord.</p>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-mist hover:border-signal/60 hover:text-paper disabled:opacity-60"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          Synchroniser
        </button>
      </div>

      <form onSubmit={save} className="space-y-5 rounded-xl border border-line bg-panel p-5">
        <Field label="Préfixe des commandes">
          <input
            required
            maxLength={5}
            value={values.prefix}
            onChange={(e) => setValues({ ...values, prefix: e.target.value })}
            className="input w-24"
          />
        </Field>

        <Field label="Salon de bienvenue" hint="Salon où le bot annonce l'arrivée des nouveaux membres.">
          <select
            value={values.welcomeChannelId ?? ""}
            onChange={(e) => setValues({ ...values, welcomeChannelId: e.target.value || null })}
            className="input"
          >
            <option value="">Désactivé</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Message de bienvenue" hint="Utilise {user} pour mentionner le nouveau membre.">
          <textarea
            rows={3}
            value={values.welcomeMessage ?? ""}
            onChange={(e) => setValues({ ...values, welcomeMessage: e.target.value || null })}
            placeholder="Bienvenue {user} sur le serveur !"
            className="input resize-none"
          />
        </Field>

        <Field label="Rôle automatique" hint="Attribué automatiquement à l'arrivée d'un membre.">
          <select
            value={values.autoRoleId ?? ""}
            onChange={(e) => setValues({ ...values, autoRoleId: e.target.value || null })}
            className="input"
          >
            <option value="">Désactivé</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-good">{message}</p>}

        <button
          disabled={saving}
          className="focus-ring rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal2 disabled:opacity-60"
        >
          Enregistrer
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #171a26;
          border: 1px solid #2a2f42;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          color: #f4f5fa;
          outline: none;
        }
        .input:focus {
          border-color: #8e7cff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist">{hint}</span>}
    </label>
  );
}
