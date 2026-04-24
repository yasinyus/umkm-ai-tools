"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "./nav-config";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="w-5 h-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 bg-sidebar">
        <SheetHeader className="flex flex-row items-center gap-2.5 px-5 h-14 border-b space-y-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <SheetTitle className="font-semibold text-sm tracking-tight">
            SosmedAI
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
          })}
        </nav>

        <div className="px-4 py-4 border-t">
          <div className="rounded-md bg-muted px-3 py-2.5">
            <p className="text-xs font-medium text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              1,200 / 2,000 credits used
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
