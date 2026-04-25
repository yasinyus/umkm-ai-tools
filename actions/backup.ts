"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import ExcelJS from "exceljs";

export async function generateAndSendBackup(): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const [user, customers, chatHistory, products, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.customer.findMany({
      where: { userId },
      include: { _count: { select: { chatHistory: true } } },
    }),
    prisma.chatHistory.findMany({
      where: { customer: { userId } },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { customer: { select: { name: true, whatsappNumber: true } } },
    }),
    prisma.product.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId } }),
  ]);

  if (!user?.email) {
    return { ok: false, message: "Email user tidak ditemukan." };
  }

  // ── Build Excel workbook ───────────────────────────────────────────────────
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SosmedAI";
  workbook.created = new Date();

  // Sheet 1: Customers
  const custSheet = workbook.addWorksheet("Pelanggan CRM");
  custSheet.columns = [
    { header: "Nama", key: "name", width: 25 },
    { header: "WhatsApp", key: "whatsappNumber", width: 20 },
    { header: "Segmen", key: "segment", width: 12 },
    { header: "Total Belanja", key: "totalSpend", width: 18 },
    { header: "Jumlah Chat", key: "chatCount", width: 14 },
    { header: "Bot Aktif", key: "isBotActive", width: 12 },
    { header: "Terakhir Chat", key: "lastContactedAt", width: 22 },
    { header: "AI Context", key: "aiContext", width: 50 },
    { header: "Bergabung", key: "createdAt", width: 22 },
  ];
  custSheet.getRow(1).font = { bold: true };
  customers.forEach((c) => {
    custSheet.addRow({
      name: c.name,
      whatsappNumber: c.whatsappNumber,
      segment: c.segment,
      totalSpend: c.totalSpend,
      chatCount: c._count.chatHistory,
      isBotActive: c.isBotActive ? "Ya" : "Tidak",
      lastContactedAt: c.lastContactedAt?.toLocaleString("id-ID") ?? "-",
      aiContext: c.aiContext ?? "",
      createdAt: c.createdAt.toLocaleString("id-ID"),
    });
  });

  // Sheet 2: Chat History
  const chatSheet = workbook.addWorksheet("Histori Chat");
  chatSheet.columns = [
    { header: "Pelanggan", key: "customerName", width: 25 },
    { header: "WhatsApp", key: "whatsappNumber", width: 20 },
    { header: "Arah", key: "direction", width: 10 },
    { header: "Pesan", key: "message", width: 80 },
    { header: "Waktu", key: "createdAt", width: 22 },
  ];
  chatSheet.getRow(1).font = { bold: true };
  chatHistory.forEach((m) => {
    chatSheet.addRow({
      customerName: m.customer.name,
      whatsappNumber: m.customer.whatsappNumber,
      direction: m.direction === "INBOUND" ? "Masuk" : "Keluar",
      message: m.message,
      createdAt: m.createdAt.toLocaleString("id-ID"),
    });
  });

  // Sheet 3: Products & HPP
  const prodSheet = workbook.addWorksheet("Produk & HPP");
  prodSheet.columns = [
    { header: "Produk", key: "name", width: 30 },
    { header: "Harga Jual", key: "sellingPrice", width: 18 },
    { header: "COGS (HPP)", key: "cogs", width: 18 },
    { header: "Margin (%)", key: "marginPct", width: 14 },
    { header: "Update", key: "updatedAt", width: 22 },
  ];
  prodSheet.getRow(1).font = { bold: true };
  products.forEach((p) => {
    prodSheet.addRow({
      name: p.name,
      sellingPrice: p.sellingPrice,
      cogs: p.cogs,
      marginPct: p.marginPct.toFixed(1),
      updatedAt: p.updatedAt.toLocaleString("id-ID"),
    });
  });

  // Sheet 4: Transactions
  const txSheet = workbook.addWorksheet("Transaksi");
  txSheet.columns = [
    { header: "Order ID", key: "orderId", width: 30 },
    { header: "Nominal", key: "amount", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Tanggal", key: "createdAt", width: 22 },
  ];
  txSheet.getRow(1).font = { bold: true };
  transactions.forEach((t) => {
    txSheet.addRow({
      orderId: t.orderId,
      amount: t.amount,
      status: t.status,
      createdAt: t.createdAt.toLocaleString("id-ID"),
    });
  });

  // ── Export to buffer ───────────────────────────────────────────────────────
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");

  await sendEmail({
    to: user.email,
    subject: `[SosmedAI] Backup Data Mingguan — ${dateStr}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">📊 Backup Data Mingguan SosmedAI</h2>
        <p>Halo ${user.name ?? "Pemilik Toko"},</p>
        <p>Terlampir adalah backup data bisnis Anda per tanggal <strong>${dateStr}</strong>.</p>
        <p>File Excel berisi:</p>
        <ul>
          <li>✅ Data Pelanggan CRM (${customers.length} pelanggan)</li>
          <li>✅ Histori Chat WhatsApp (${chatHistory.length} pesan)</li>
          <li>✅ Data Produk & HPP (${products.length} produk)</li>
          <li>✅ Riwayat Transaksi (${transactions.length} transaksi)</li>
        </ul>
        <p style="color: #6b7280; font-size: 14px;">Backup ini dikirimkan otomatis setiap minggu oleh SosmedAI.</p>
        <hr />
        <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} SosmedAI — Platform AI untuk UMKM Indonesia</p>
      </div>
    `,
    attachments: [
      {
        filename: `sosmedai-backup-${dateStr}.xlsx`,
        content: buffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });

  return { ok: true, message: `Backup berhasil dikirim ke ${user.email}` };
}
