"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus, Bell, User, Settings, CreditCard, LogOut, MonitorOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./mobile-sidebar";
import { signOutUser, signOutAllDevices } from "@/actions/auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ai-image-editor": "AI Image Editor",
  "/caption-generator": "Caption Generator",
  "/history": "History",
  "/hpp": "HPP Optimizer",
  "/competitors": "Competitor Intelligence",
  "/reply-assistant": "Reply Assistant",
  "/trends": "Trend Watch",
  "/catalog": "Katalog Digital",
  "/scheduler": "Content Calendar",
  "/billing": "Billing & Langganan",
  "/settings": "Settings",
  "/ai-coach": "AI Business Coach",
  "/bio-link": "Smart Bio-Link",
  "/crm": "CRM Dashboard",
  "/whatsapp": "WhatsApp Automation",
};

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function Header({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] ?? "Dashboard";
  const initials = getInitials(user.name, user.email);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background px-4 md:px-6 h-14 shrink-0">
      <MobileSidebar />

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create New</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="w-4 h-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold truncate">{user.name ?? "User"}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer"
              onClick={() => router.push("/settings?tab=profile")}
            >
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 text-sm cursor-pointer"
              onClick={() => router.push("/billing")}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive p-0">
              <form action={signOutUser} className="flex items-center gap-2 w-full px-2 py-1.5">
                <LogOut className="w-4 h-4 shrink-0" />
                <button type="submit" className="w-full text-left">
                  Sign Out
                </button>
              </form>
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive p-0">
              <form action={signOutAllDevices} className="flex items-center gap-2 w-full px-2 py-1.5">
                <MonitorOff className="w-4 h-4 shrink-0" />
                <button type="submit" className="w-full text-left">
                  Keluar Semua Perangkat
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
