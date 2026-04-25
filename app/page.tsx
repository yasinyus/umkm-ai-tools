import type React from "react";
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
  MessageSquareText,
  BrainCircuit,
  Link2,
  ChevronDown,
  Quote,
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

type Feature = {
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  tags: string[];
  isNew?: boolean;
};

const features: Feature[] = [
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
  {
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "CRM Dashboard",
    desc: "Kelola data pelanggan WhatsApp secara terpusat. Segmentasi otomatis (Loyal/Baru/At-Risk), pantau riwayat chat, dan baca AI Insights untuk setiap pelanggan.",
    tags: ["Segmentasi AI", "Riwayat chat", "Smart filter"],
    isNew: true,
  },
  {
    icon: MessageSquareText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "AI WhatsApp Automation",
    desc: "Bot AI yang membalas pesan WhatsApp pelanggan 24/7 menggunakan GPT-4o. Terintegrasi dengan data CRM — menyapa nama, menawarkan produk favorit, dan update knowledge base otomatis.",
    tags: ["GPT-4o replies", "Fonnte & Meta API", "Take Over mode"],
    isNew: true,
  },
  {
    icon: BrainCircuit,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "AI Business Coach",
    desc: "Konsultan bisnis AI berbasis GPT-4o yang membaca data HPP, margin, dan pelanggan Anda secara real-time untuk memberikan saran strategis yang presisi dan actionable.",
    tags: ["Analisis margin", "Strategi harga", "Retensi pelanggan"],
    isNew: true,
  },
  {
    icon: Link2,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Smart Bio-Link",
    desc: "Buat halaman profil publik UMKM Anda dalam hitungan menit. Tampilkan menu, harga, tombol WA, Instagram, TikTok — semua di satu link yang bisa dibagikan.",
    tags: ["Link publik", "Menu & harga", "Multi-platform"],
    isNew: true,
  },
];

const pricingPlans = [
  {
    name: "Trial Gratis",
    price: "Rp 0",
    period: "7 hari akses penuh",
    description: "Coba semua 13 fitur AI tanpa komitmen. Tidak perlu kartu kredit.",
    features: [
      "Semua 13 fitur AI",
      "AI Business Coach (GPT-4o)",
      "Smart Bio-Link Generator",
      "CRM Dashboard + AI Insights",
      "AI WhatsApp Bot 24/7",
      "HPP Optimizer & Caption AI",
      "Katalog Digital & Content Calendar",
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
      "Semua 13 fitur AI tanpa batas",
      "AI Business Coach GPT-4o",
      "Smart Bio-Link publik",
      "CRM + WhatsApp Bot 24/7",
      "Backup data otomatis (Excel)",
      "Simpan hingga 10.000 konten",
      "Garansi uang kembali 3 hari",
    ],
    cta: "Mulai Trial — Upgrade Nanti",
    highlighted: true,
  },
];

const testimonials = [
  {
    name: "Sari Wahyuni",
    role: "Pemilik Warung Makan",
    location: "Bogor",
    avatar: "SW",
    content: "Dulu balas pesan WhatsApp seharian sampai kelelahan. Sekarang AI yang balas otomatis, pelanggan senang, saya bisa fokus masak. Omzet naik 40% dalam 2 bulan!",
    stars: 5,
  },
  {
    name: "Budi Santoso",
    role: "Penjual Hijab Online",
    location: "Bandung",
    avatar: "BS",
    content: "Foto produk saya dulu plain banget. Sekarang pakai AI Image Editor, background langsung bisa ganti jadi studio. Customer bilang foto saya paling cantik di kategori!",
    stars: 5,
  },
  {
    name: "Dewi Kurnia",
    role: "Warung Kopi & Snack",
    location: "Surabaya",
    avatar: "DK",
    content: "AI Business Coach bantu saya sadar margin kopi saya terlalu kecil. Setelah ikuti sarannya, profit per cup naik dari 15% jadi 35%. Luar biasa!",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Apakah saya perlu keahlian teknis untuk menggunakan SosmedAI?",
    a: "Tidak sama sekali. SosmedAI dirancang untuk pemilik UMKM yang sibuk — cukup login dengan Google, isi informasi toko Anda, dan semua fitur AI siap digunakan dalam hitungan menit.",
  },
  {
    q: "Bagaimana cara kerja AI WhatsApp Bot?",
    a: "Setelah Anda mengisi Knowledge Base toko (menu, harga, jam buka, alamat) dan menghubungkan akun WhatsApp Business via Fonnte atau Meta Cloud API, bot akan otomatis membalas setiap pesan masuk menggunakan GPT-4o. Anda bisa 'Take Over' kapan saja untuk membalas manual.",
  },
  {
    q: "Apakah data bisnis saya aman?",
    a: "Ya. Data Anda disimpan di database PostgreSQL yang terenkripsi. Kami tidak berbagi data Anda dengan pihak ketiga. Anda bisa menghapus akun beserta semua data kapan saja.",
  },
  {
    q: "Berapa batas penggunaan fitur AI per bulan?",
    a: "Selama trial 7 hari Anda bisa menggunakan semua fitur tanpa batas. Paket UMKM Rp 49.000/bulan juga memberikan akses tidak terbatas untuk semua 13 fitur AI.",
  },
  {
    q: "Bagaimana jika saya tidak puas setelah berlangganan?",
    a: "Kami menawarkan garansi uang kembali penuh dalam 3 hari setelah pembayaran — tidak ada pertanyaan. Hubungi support WhatsApp kami dan dana dikembalikan dalam 1x24 jam.",
  },
  {
    q: "Apakah AI Business Coach bisa dipakai untuk bisnis apapun?",
    a: "Ya. AI Coach membaca data produk dan pelanggan akun Anda secara otomatis, sehingga sarannya selalu relevan — baik untuk warung makan, toko online, salon kecantikan, atau usaha konveksi.",
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
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimoni</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
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
            13 Fitur AI dalam 1 Platform · Khusus UMKM Indonesia
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
              13 Fitur AI yang Bikin Bisnis Makin Mudah
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
                  className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative ${f.isNew ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-100"}`}
                >
                  {f.isNew && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wide">
                      Baru
                    </span>
                  )}
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

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 bg-indigo-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Dipercaya UMKM Indonesia
            </h2>
            <p className="text-indigo-200 text-lg">
              Cerita nyata dari pemilik usaha yang sudah merasakan manfaatnya.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
                <Quote className="w-6 h-6 text-indigo-300" />
                <p className="text-white text-sm leading-relaxed">{t.content}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-indigo-300">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Pertanyaan yang Sering Ditanya
            </h2>
            <p className="text-gray-500 text-lg">Ada yang kurang jelas? Kami jawab di sini.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-xl border bg-white shadow-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-sm hover:bg-gray-50 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
            <Star className="w-3.5 h-3.5" />
            13 Fitur AI · Rp 49.000/bulan · Garansi 3 Hari
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Siap tingkatkan omzet bisnismu?
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Bergabung dengan UMKM Indonesia yang sudah menggunakan SosmedAI
            untuk membuat konten lebih cepat, membalas pelanggan 24/7, dan closing lebih banyak.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignInButton
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              label="Mulai Trial 7 Hari — Gratis"
            />
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Tidak perlu kartu kredit · Batal kapan saja · Login 1 klik dengan Google
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">SosmedAI</span>
              </div>
              <p className="text-xs leading-relaxed">
                Platform AI lengkap untuk UMKM Indonesia. Dari konten sosmed sampai otomatisasi WhatsApp.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" aria-label="TikTok" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.5a8.16 8.16 0 0 0 4.77 1.52V7.57a4.85 4.85 0 0 1-1-.88z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Fitur */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Fitur</p>
              <ul className="space-y-2 text-xs">
                {["AI Caption Generator", "AI Image Editor", "HPP Optimizer", "CRM Dashboard", "AI WhatsApp Bot", "AI Business Coach", "Smart Bio-Link"].map((f) => (
                  <li key={f}><a href="#features" className="hover:text-white transition-colors">{f}</a></li>
                ))}
              </ul>
            </div>

            {/* Perusahaan */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Perusahaan</p>
              <ul className="space-y-2 text-xs">
                {[
                  { label: "Fitur", href: "#features" },
                  { label: "Harga", href: "#pricing" },
                  { label: "Cara Kerja", href: "#how" },
                  { label: "Testimoni", href: "#testimonials" },
                  { label: "FAQ", href: "#faq" },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="hover:text-white transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Support</p>
              <ul className="space-y-2 text-xs">
                <li><a href="https://wa.me/6281234567890" className="hover:text-white transition-colors">WhatsApp Support</a></li>
                <li><a href="mailto:support@sosmedai.id" className="hover:text-white transition-colors">Email Support</a></li>
                <li><span className="text-gray-600">Senin–Jumat, 08.00–17.00 WIB</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© {new Date().getFullYear()} SosmedAI · Dibuat dengan ❤ untuk UMKM Indonesia</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
