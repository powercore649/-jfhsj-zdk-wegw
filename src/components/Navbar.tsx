"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { ChevronDown, LayoutGrid, LogOut, Plus, Settings } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-signal text-white">R</span>
          Relay
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-mist md:flex">
          <Link href="/" className="hover:text-paper transition-colors">Bots</Link>
          <Link href="/servers" className="hover:text-paper transition-colors">Serveurs</Link>
          <Link href="/dashboard/bots/new" className="hover:text-paper transition-colors">Ajouter un bot</Link>
          <Link href="/dashboard/serverlist/new" className="hover:text-paper transition-colors">Lister un serveur</Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" && <div className="h-9 w-24 animate-pulse rounded-lg bg-panel" />}

          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("discord")}
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-signal2"
            >
              Se connecter avec Discord
            </button>
          )}

          {status === "authenticated" && session?.user && (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="focus-ring flex items-center gap-2 rounded-lg border border-line bg-panel px-2 py-1.5 pr-3 hover:bg-panel2"
              >
                <img
                  src={
                    (session.user as any).avatar
                      ? `https://cdn.discordapp.com/avatars/${(session as any).discordId}/${(session.user as any).avatar}.png?size=64`
                      : "https://cdn.discordapp.com/embed/avatars/0.png"
                  }
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
                <span className="text-sm">{session.user.name}</span>
                <ChevronDown size={14} className="text-mist" />
              </button>

              {open && (
                <div
                  onMouseLeave={() => setOpen(false)}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel shadow-xl"
                >
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-mist hover:bg-panel2 hover:text-paper">
                    <LayoutGrid size={16} /> Tableau de bord
                  </Link>
                  <Link href="/dashboard/bots/new" className="flex items-center gap-2 px-4 py-2.5 text-sm text-mist hover:bg-panel2 hover:text-paper">
                    <Plus size={16} /> Ajouter un bot
                  </Link>
                  <Link href="/dashboard/serverlist/new" className="flex items-center gap-2 px-4 py-2.5 text-sm text-mist hover:bg-panel2 hover:text-paper">
                    <Plus size={16} /> Lister un serveur
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-mist hover:bg-panel2 hover:text-paper">
                    <Settings size={16} /> Paramètres
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm text-mist hover:bg-panel2 hover:text-paper"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
