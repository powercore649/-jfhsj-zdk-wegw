"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Star } from "lucide-react";

type Props = {
  serverId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
};

export default function AdminServerActions({ serverId, status, featured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(data: Record<string, unknown>, key: string) {
    setLoading(key);
    setError(null);
    const res = await fetch(`/api/servers/${serverId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Une erreur est survenue.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => update({ status: "APPROVED" }, "approve")}
          disabled={loading !== null || status === "APPROVED"}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-good/15 px-3 py-1.5 text-xs font-medium text-good transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={14} />
          Approuver
        </button>
        <button
          onClick={() => update({ status: "REJECTED" }, "reject")}
          disabled={loading !== null || status === "REJECTED"}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-red-400/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={14} />
          Rejeter
        </button>
        <button
          onClick={() => update({ featured: !featured }, "feature")}
          disabled={loading !== null}
          title={featured ? "Retirer de la mise en avant" : "Mettre en avant"}
          className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 ${
            featured ? "bg-signal/20 text-signal2" : "bg-panel2 text-mist"
          }`}
        >
          <Star size={14} fill={featured ? "currentColor" : "none"} />
          {featured ? "Mis en avant" : "Mettre en avant"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
