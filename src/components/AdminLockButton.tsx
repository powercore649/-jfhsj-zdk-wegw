"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLockButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function lock() {
    setLoading(true);
    await fetch("/api/admin/login", { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={lock}
      disabled={loading}
      className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition-colors hover:bg-panel2 hover:text-paper disabled:opacity-60"
    >
      <Lock size={13} />
      Verrouiller
    </button>
  );
}
