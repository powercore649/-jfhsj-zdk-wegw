"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutGrid, ListPlus, Server, Settings, ShieldCheck } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Aperçu", icon: LayoutGrid },
  { href: "/dashboard/bots", label: "Mes bots", icon: Bot },
  { href: "/dashboard/servers", label: "Mes serveurs", icon: Server },
  { href: "/dashboard/serverlist", label: "Serveurs listés", icon: ListPlus },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...items, { href: "/dashboard/admin", label: "Administration", icon: ShieldCheck }]
    : items;

  return (
    <aside className="w-full shrink-0 md:w-56">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`focus-ring flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                active ? "bg-panel2 text-paper" : "text-mist hover:bg-panel hover:text-paper"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
