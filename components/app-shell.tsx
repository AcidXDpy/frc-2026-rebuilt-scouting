"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, BrainCircuit, ClipboardList, Database, Gauge, ListOrdered, Moon, Settings, ShieldCheck, Sun, Target, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/scout", label: "Scout", icon: ClipboardList },
  { href: "/pit", label: "Pit", icon: Database },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ml", label: "ML Lab", icon: BrainCircuit },
  { href: "/picklist", label: "Picklist", icon: ListOrdered },
  { href: "/strategy", label: "Strategy", icon: Target },
  { href: "/quality", label: "Quality", icon: ShieldCheck },
  { href: "/admin", label: "Admin", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-primary/25 bg-[#050505]/95 text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <Image src="/team-logo.png" alt="M.O.R.T. team logo" width={426} height={97} priority className="h-9 w-auto max-w-[220px] object-contain sm:h-11" />
            <div className="hidden min-w-0 border-l border-primary/35 pl-4 sm:block">
              <p className="truncate text-sm font-semibold text-primary">REBUILT Scouting</p>
              <p className="truncate text-xs text-zinc-400">Match intelligence console</p>
            </div>
          </Link>
          <Button variant="outline" size="icon" className="border-primary/40 bg-black text-primary hover:bg-primary hover:text-black" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
        </div>
        <div className="gold-rule" />
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white",
                pathname === href && "bg-primary text-black shadow-[0_0_20px_rgba(255,204,0,0.25)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">{children}</main>
    </div>
  );
}
