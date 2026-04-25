"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import { signOutUser } from "@/actions/auth";

export function Sidebar() {
  const pathname = usePathname();

  // Group items: items with same group label appear under a divider
  const rendered: React.ReactNode[] = [];
  let lastGroup: string | undefined = undefined;

  navItems.forEach((item) => {
    if (item.group && item.group !== lastGroup) {
      rendered.push(
        <p key={`group-${item.group}`} className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {item.group}
        </p>
      );
      lastGroup = item.group;
    }
    const Icon = item.icon;
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    rendered.push(
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {item.label}
      </Link>
    );
  });

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-sidebar h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">SosmedAI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {rendered}
      </nav>

      <div className="px-4 py-4 border-t shrink-0 space-y-3">
        <div className="rounded-md bg-muted px-3 py-2.5">
          <p className="text-xs font-medium text-foreground">Free Plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            1,200 / 2,000 credits used
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-primary" />
          </div>
        </div>

        <form action={signOutUser}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
