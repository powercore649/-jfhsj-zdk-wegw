"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Star } from "lucide-react";

export default function VoteButton({ botId, initialVotes }: { botId: string; initialVotes: number }) {
  const { status } = useSession();
  const [votes, setVotes] = useState(initialVotes);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function vote() {
    if (status !== "authenticated") {
      signIn("discord");
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/bots/${botId}/vote`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setVotes(data.votes);
      setMessage("Merci pour ton vote !");
    } else {
      setMessage(data.error ?? "Une erreur est survenue.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={vote}
        disabled={loading}
        className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Star size={16} fill="currentColor" />
        Voter ({votes})
      </button>
      {message && <p className="text-xs text-mist">{message}</p>}
    </div>
  );
}
