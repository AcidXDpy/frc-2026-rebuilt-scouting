"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, Database, Gauge, ListOrdered, Moon, Settings, ShieldCheck, Sun, Target, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/scout", label: "Scout", icon: ClipboardList },
  { href: "/pit", label: "Pit", icon: Database },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
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
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">26</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">REBUILT Scouting</p>
              <p className="truncate text-xs text-muted-foreground">Live competition command center</p>
            </div>
          </Link>
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                pathname === href && "bg-muted text-foreground"
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
