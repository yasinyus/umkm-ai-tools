"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  LogOut,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateDisplayName } from "@/actions/settings";
import { signOutUser } from "@/actions/auth";
import Link from "next/link";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  subscriptionStatus: string;
  subscriptionEndAt: Date | null;
};

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const NOTIF_ITEMS = [
  {
    key: "product_updates",
    label: "Update fitur baru",
    desc: "Notifikasi saat ada fitur atau update terbaru pada platform",
  },
  {
    key: "usage_alerts",
    label: "Alert penggunaan AI",
    desc: "Peringatan saat mendekati batas penggunaan bulanan",
  },
  {
    key: "tips",
    label: "Tips & tutorial",
    desc: "Panduan penggunaan fitur untuk mengembangkan bisnis Anda",
  },
  {
    key: "marketing",
    label: "Email promosi",
    desc: "Penawaran khusus dan diskon berlangganan dari SosmedAI",
  },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name)
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  return email?.[0]?.toUpperCase() ?? "U";
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsClient({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

  const [name, setName] = useState(profile?.name ?? "");
  const [savedName, setSavedName] = useState(profile?.name ?? "");
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("sosmedai_notif_prefs");
    if (stored) {
      try {
        setNotifPrefs(JSON.parse(stored));
      } catch {
        // ignore parse error
      }
    } else {
      const defaults = Object.fromEntries(NOTIF_ITEMS.map((k) => [k.key, true]));
      setNotifPrefs(defaults);
    }
  }, []);

  function setTab(tab: string) {
    router.push(`/settings?tab=${tab}`);
  }

  function toggleNotif(key: string) {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("sosmedai_notif_prefs", JSON.stringify(updated));
  }

  function handleSaveName() {
    setNameError(null);
    setNameSaved(false);
    startTransition(async () => {
      const result = await updateDisplayName(name);
      if ("error" in result) {
        setNameError(result.error);
      } else {
        setSavedName(name);
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 3000);
      }
    });
  }

  const initials = getInitials(profile?.name, profile?.email);
  const isActive = profile?.subscriptionStatus === "ACTIVE";
  const isTrial = profile?.subscriptionStatus === "TRIAL";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola preferensi dan konfigurasi akun Anda.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
          {/* Avatar + identity */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={profile?.image ?? ""} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {profile?.name ?? "Pengguna"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email}
              </p>
              <Badge variant="secondary" className="mt-1.5 text-xs gap-1.5">
                <Globe className="w-3 h-3" />
                Login dengan Google
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Edit name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Nama Tampilan</Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <Button
                onClick={handleSaveName}
                disabled={isPending || name.trim() === savedName}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : nameSaved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {nameSaved ? "Tersimpan!" : "Simpan"}
              </Button>
            </div>
            {nameError && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {nameError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Nama ditampilkan di dashboard dan konten AI yang dibuat.
            </p>
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="max-w-xs bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email terhubung ke Google OAuth dan tidak dapat diubah di sini.
            </p>
          </div>

          {/* Account info */}
          <div className="space-y-2">
            <Label>Info Akun</Label>
            <div className="rounded-lg bg-muted/50 border px-4 py-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Bergabung sejak
                </span>
                <span className="font-medium text-xs">
                  {profile ? formatDate(profile.createdAt) : "-"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status langganan</span>
                <span
                  className={`text-xs font-semibold ${
                    isActive
                      ? "text-emerald-600"
                      : isTrial
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {isActive ? "Aktif (Pro)" : isTrial ? "Trial" : "Tidak aktif"}
                </span>
              </div>
              {isActive && profile?.subscriptionEndAt && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Berlaku hingga
                    </span>
                    <span className="text-xs font-medium">
                      {formatDate(profile.subscriptionEndAt)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === "notifications" && (
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-sm">Preferensi Notifikasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pilih notifikasi yang ingin Anda terima dari SosmedAI.
            </p>
          </div>
          <Separator />

          <div className="space-y-5">
            {NOTIF_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <Toggle
                  checked={notifPrefs[item.key] ?? true}
                  onChange={() => toggleNotif(item.key)}
                />
              </div>
            ))}
          </div>

          <Separator />
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Pengaturan ini tersimpan di browser. Untuk berhenti berlangganan
            email, hubungi support kami via WhatsApp.
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          {/* OAuth provider */}
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Metode Login</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Akun Anda menggunakan OAuth Google. Tidak ada password yang
                disimpan di server kami.
              </p>
            </div>
            <Separator />
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 border px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200 shrink-0"
              >
                Terhubung
              </Badge>
            </div>
          </div>

          {/* Session management */}
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-sm">Sesi Aktif</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kelola sesi login aktif di semua perangkat.
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Keluar dari semua perangkat</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mengakhiri semua sesi aktif, termasuk sesi ini.
                </p>
              </div>
              <form action={signOutUser}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Menghapus akun bersifat permanen. Semua data konten AI, history,
              produk, dan pengaturan akan dihapus selamanya dan tidak bisa
              dipulihkan.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Hapus Akun Permanen
            </Button>
          </div>
        </div>
      )}

      {/* ── Billing Tab ── */}
      {activeTab === "billing" && (
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-sm">Status Langganan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ringkasan paket aktif Anda saat ini.
            </p>
          </div>
          <Separator />

          <div className="rounded-lg border bg-muted/30 px-4 py-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paket saat ini</span>
              <span
                className={`font-bold ${
                  isActive
                    ? "text-emerald-600"
                    : isTrial
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {isActive
                  ? "Paket UMKM"
                  : isTrial
                  ? "Trial Gratis (7 hari)"
                  : "Tidak Berlangganan"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  isActive
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : isTrial
                    ? "text-amber-700 bg-amber-50 border-amber-200"
                    : "text-red-700 bg-red-50 border-red-200"
                }`}
              >
                {isActive ? "Aktif" : isTrial ? "Trial" : "Tidak Aktif"}
              </Badge>
            </div>
            {isActive && profile?.subscriptionEndAt && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Berlaku hingga</span>
                  <span className="font-medium text-xs">
                    {formatDate(profile.subscriptionEndAt)}
                  </span>
                </div>
              </>
            )}
          </div>

          <Link href="/billing" className="block">
            <Button className="w-full gap-2">
              <CreditCard className="w-4 h-4" />
              {isActive ? "Kelola Langganan" : "Upgrade ke Paket Pro"}
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground">
            Untuk pertanyaan billing, hubungi support kami via WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
