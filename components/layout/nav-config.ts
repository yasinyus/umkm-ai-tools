import {
  LayoutDashboard,
  ImageIcon,
  MessageSquare,
  History,
  Settings,
  TrendingUp,
  CalendarClock,
  Store,
  Calculator,
  BarChart2,
  Sparkles,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Image Editor", href: "/ai-image-editor", icon: ImageIcon },
  { label: "Caption Generator", href: "/caption-generator", icon: MessageSquare },
  { label: "History", href: "/history", icon: History },
  { label: "HPP Optimizer", href: "/hpp", icon: Calculator },
  { label: "Competitor Intel", href: "/competitors", icon: BarChart2 },
  { label: "Reply Assistant", href: "/reply-assistant", icon: Sparkles },
  { label: "Trend Watch", href: "/trends", icon: TrendingUp },
  { label: "Katalog Digital", href: "/catalog", icon: Store },
  { label: "Content Calendar", href: "/scheduler", icon: CalendarClock },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];
