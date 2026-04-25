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
  Users,
  MessageSquareText,
  BrainCircuit,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
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
  { label: "AI Business Coach", href: "/ai-coach", icon: BrainCircuit, group: "Business Tools" },
  { label: "Smart Bio-Link", href: "/bio-link", icon: Link2, group: "Business Tools" },
  { label: "CRM Dashboard", href: "/crm", icon: Users, group: "CRM & WhatsApp" },
  { label: "WA Automation", href: "/whatsapp", icon: MessageSquareText, group: "CRM & WhatsApp" },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];
