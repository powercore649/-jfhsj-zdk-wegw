"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "create" | "edit";

export type ServerFormValues = {
  discordId?: string;
  name?: string;
  icon?: string | null;
  shortDesc: string;
  longDesc: string;
  inviteUrl: string;
  tags: string;
};

const ALL_TAGS = ["Gaming", "Communauté", "Fun", "Musique", "Art", "IA", "Éducation", "Rôle-play", "Tech"];

export default function ServerForm({
  mode,
  serverId,
  initial,
}: {
  mode: Mode;
  serverId?: string;
  initial?: ServerFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ServerFormValues>(
    initial ?? {
      discordId: "",
      name: "",
      icon: null,
      shortDesc: "",
      longDesc: "",
      inviteUrl: "",
      tags: "",
    }
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tags ? initial.tags.split(",").filter(Boolean) : []
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...values,
      tags: selectedTags,
    };

    const res = await fetch(mode === "create" ? "/api/servers" : `/api/servers/${serverId}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Merci de vérifier les champs du formulaire.");
      return;
    }
    const server = await res.json();
    router.push(mode === "create" ? "/dashboard/serverlist" : `/servers/${server.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!serverId || !confirm("Retirer définitivement ce serveur de l'annuaire ?")) return;
    setLoading(true);
    await fetch(`/api/servers/${serverId}`, { method: "DELETE" });
    router.push("/dashboard/serverlist");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      {mode === "create" && (
        <>
          <Field label="ID du serveur Discord" hint="Active le mode développeur sur Discord pour copier l'ID.">
            <input
              required
              value={values.discordId}
              onChange={(e) => setValues({ ...values, discordId: e.target.value })}
              className="input"
              placeholder="1234567890123456789"
            />
          </Field>
          <Field label="Nom du serveur">
            <input
              required
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="input"
              placeholder="Mon serveur"
            />
          </Field>
        </>
      )}

      <Field label="Description courte" hint="150 caractères maximum, affichée dans les listes.">
        <input
          required
          maxLength={150}
          value={values.shortDesc}
          onChange={(e) => setValues({ ...values, shortDesc: e.target.value })}
          className="input"
        />
      </Field>

      <Field label="Description complète">
        <textarea
          required
          rows={6}
          value={values.longDesc}
          onChange={(e) => setValues({ ...values, longDesc: e.target.value })}
          className="input resize-none"
        />
      </Field>

      <Field label="Lien d'invitation" hint="Un lien Discord permanent, ex. https://discord.gg/tonserveur">
        <input
          required
          value={values.inviteUrl}
          onChange={(e) => setValues({ ...values, inviteUrl: e.target.value })}
          className="input"
          placeholder="https://discord.gg/..."
        />
      </Field>

      <Field label="Tags" hint="5 maximum">
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTag(t)}
              className={`tag-pill transition-colors ${selectedTags.includes(t) ? "border-signal bg-signal/10 text-paper" : "hover:text-paper"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button disabled={loading} className="focus-ring rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal2 disabled:opacity-60">
          {mode === "create" ? "Soumettre le serveur" : "Enregistrer"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} className="text-sm text-red-400 hover:underline">
            Retirer le serveur
          </button>
        )}
      </div>

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
    </form>
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
