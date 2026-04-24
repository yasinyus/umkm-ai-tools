import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signInWithGoogle } from "@/actions/auth";
import {
  ImageIcon,
  MessageSquare,
  Calculator,
  BarChart2,
  Sparkles,
  TrendingUp,
  Store,
  CalendarClock,
  History,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Shield,
  Users,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "SosmedAI — Platform AI Lengkap untuk UMKM Indonesia",
  description:
    "AI Image Editor, Caption Generator, HPP Optimizer, Competitor Intel, dan lebih banyak lagi — satu platform untuk bisnis Anda tumbuh lebih cepat.",
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function SignInButton({
  className,
  label = "Mulai Trial 7 Hari — Gratis",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        }
      >
        <GoogleIcon className="w-5 h-5 shrink-0" />
        {label}
      </button>
    </form>
  );
}

const features = [
  {
    icon: MessageSquare,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "AI Caption Generator",
    desc: "Buat caption untuk Instagram, TikTok, dan LinkedIn dalam 4 gaya berbeda. Otomatis tambah hashtag & emoji relevan menggunakan AI Llama 4.",
    tags: ["4 gaya penulisan", "Multi-platform", "Hashtag otomatis"],
  },
  {
    icon: ImageIcon,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "AI Image Editor",
    desc: "Upload foto produk, hapus background secara otomatis, lalu ganti dengan background profesional sesuai deskripsi — dalam hitungan detik.",
    tags: ["Hapus background", "Generate background AI", "Download HD"],
  },
  {
    icon: Calculator,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "HPP Optimizer (OCR)",
    desc: "Scan foto nota belanja dengan AI — harga bahan baku otomatis diperbarui, HPP produk dihitung ulang, dan margin alert muncul jika profit tergerus.",
    tags: ["Scan nota AI", "Hitung COGS otomatis", "Margin alert"],
  },
  {
    icon: BarChart2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Competitor Intelligence",
    desc: "Pantau harga kompetitor di Tokopedia, Shopee, dan GoFood. AI memberikan rekomendasi strategi harga yang konkret dan actionable.",
    tags: ["Monitor harga", "AI recommendation", "Bar chart visual"],
  },
  {
    icon: Sparkles,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "AI Reply Assistant",
    desc: "Balas pesan calon pembeli dengan 3 gaya sekaligus: Ramah/Bunda-bunda, To-the-Point, dan Hard Sell. Langsung copy atau kirim via WhatsApp.",
    tags: ["3 gaya balasan AI", "Copy 1 klik", "WA deep link"],
  },
  {
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Trend Watch",
    desc: "Pantau tren produk terlaris di marketplace Indonesia. AI menganalisis dan memberikan insight actionable untuk konten sosial media Anda.",
    tags: ["Data marketplace", "AI insights", "Update mingguan"],
  },
  {
    icon: Store,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Katalog Digital",
    desc: "Buat mini landing page dari konten AI Anda dalam hitungan menit. Bagikan ke bio Instagram atau WhatsApp dengan satu link yang rapi.",
    tags: ["Mini landing page", "Link bio-ready", "Tombol WA contact"],
  },
  {
    icon: CalendarClock,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Content Calendar",
    desc: "Jadwalkan kapan konten Anda akan diposting. Atur antrean posting dan pantau status draft, terjadwal, hingga sudah terposting.",
    tags: ["Jadwal posting", "Status tracking", "Queue management"],
  },
  {
    icon: History,
    color: "text-gray-600",
    bg: "bg-gray-100",
    title: "Riwayat Konten",
    desc: "Semua caption dan gambar AI tersimpan otomatis di akun Anda. Akses, filter, dan download ulang kapan saja tanpa kehilangan karya Anda.",
    tags: ["Tersimpan otomatis", "Filter by type", "Download ulang"],
  },
];

const pricingPlans = [
  {
    name: "Trial Gratis",
    price: "Rp 0",
    period: "7 hari akses penuh",
    description: "Coba semua fitur tanpa komitmen. Tidak perlu kartu kredit.",
    features: [
      "Semua 9 fitur AI",
      "AI Caption Generator",
      "AI Image Editor",
      "HPP Optimizer",
      "Reply Assistant",
      "Katalog Digital",
      "Content Calendar",
    ],
    cta: "Mulai Trial Gratis",
    highlighted: false,
  },
  {
    name: "Paket UMKM",
    price: "Rp 49.000",
    period: "per bulan",
    description: "Akses penuh tanpa batas + support WhatsApp langsung dari tim kami.",
    features: [
      "Semua fitur Trial +",
      "Akses tidak terbatas",
      "Priority support WhatsApp",
      "Update fitur terbaru",
      "Simpan hingga 10.000 konten",
      "Export & download HD",
      "Garansi uang kembali 3 hari",
    ],
    cta: "Mulai Trial — Upgrade Nanti",
    highlighted: true,
  },
];

const steps = [
  {
    step: "01",
    title: "Login dengan Google",
    desc: "Daftar dalam 1 klik menggunakan akun Google. Langsung dapat trial 7 hari penuh, gratis.",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    step: "02",
    title: "Pilih Tool AI-mu",
    desc: "Dari caption generator sampai HPP optimizer — pilih fitur yang paling dibutuhkan bisnis kamu sekarang.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    step: "03",
    title: "Posting & Closing",
    desc: "Copy caption, download gambar, atau kirim langsung via WhatsApp. Bisnis makin ramai, waktu makin efisien.",
    color: "text-emerald-600 bg-emerald-50",
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SosmedAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Harga</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">Cara Kerja</a>
          </div>
          <SignInButton
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
            label="Masuk"
          />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-indigo-50 blur-3xl opacity-60" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
            <Star className="w-3.5 h-3.5" />
            9 Fitur AI dalam 1 Platform · Khusus UMKM Indonesia
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Satu Platform AI untuk{" "}
            <span className="text-indigo-600">Semua Kebutuhan</span>{" "}
            Bisnis Anda
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Dari buat caption viral, edit foto produk, hitung HPP, pantau kompetitor,
            sampai balas pesan pembeli — semuanya dengan AI, dalam satu aplikasi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignInButton />
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors"
            >
              Lihat Semua Fitur
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />Gratis 7 hari</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />Tanpa kartu kredit</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />Login 1 klik</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              9 Fitur AI yang Bikin Bisnis Makin Mudah
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Dirancang khusus untuk kebutuhan operasional UMKM Indonesia sehari-hari.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Mulai dalam 60 detik
            </h2>
            <p className="text-gray-500 text-lg">Tidak perlu keahlian teknis. Langsung pakai.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className={`inline-flex w-14 h-14 rounded-2xl ${item.color} items-center justify-center text-2xl font-black mb-4`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Harga Transparan, Tanpa Kejutan
            </h2>
            <p className="text-gray-500 text-lg">
              Mulai gratis selama 7 hari. Upgrade kapan saja, batalkan kapan saja.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 space-y-5 ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-white/20 text-white font-bold uppercase tracking-wider">
                    Paling Populer
                  </span>
                )}
                <div>
                  <p className={`text-sm font-semibold ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>
                      /{plan.period.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${plan.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? "text-white" : "text-gray-700"}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-indigo-200" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <SignInButton
                  label={plan.cta}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? "bg-white text-indigo-700 hover:bg-indigo-50 shadow-md"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-400" />Pembayaran aman via Midtrans</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" />Batalkan kapan saja</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" />Support WhatsApp</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Siap tingkatkan omzet bisnismu?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
            Bergabung dengan UMKM Indonesia yang sudah menggunakan SosmedAI
            untuk membuat konten lebih cepat dan closing lebih banyak.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignInButton
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-base shadow-xl hover:bg-indigo-50 transition-colors"
              label="Mulai Trial 7 Hari — Gratis"
            />
          </div>
          <p className="text-indigo-300 text-sm mt-4">
            Tidak perlu kartu kredit · Batal kapan saja · Login 1 klik dengan Google
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-700">SosmedAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-700 transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-gray-700 transition-colors">Harga</a>
            <a href="#how" className="hover:text-gray-700 transition-colors">Cara Kerja</a>
          </div>
          <p>© {new Date().getFullYear()} SosmedAI · Dibuat untuk UMKM Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
