import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import ExcelJS from "exceljs";

// Vercel Cron: runs every Monday at 09:00 WIB (02:00 UTC)
// vercel.json: { "crons": [{ "path": "/api/cron/weekly-backup", "schedule": "0 2 * * 1" }] }

export async function GET(req: NextRequest) {
  // Protect with bearer token
  const auth = req.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET ?? "";

  if (expectedToken && auth !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all active/trial users who want backups
  const users = await prisma.user.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true, name: true, email: true },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      await sendBackupForUser(user.id, user.name, user.email);
      sent++;
    } catch (err) {
      errors.push(`${user.email}: ${String(err)}`);
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}

async function sendBackupForUser(userId: string, name: string | null, email: string) {
  const [customers, products, transactions] = await Promise.all([
    prisma.customer.findMany({
      where: { userId },
      include: { _count: { select: { chatHistory: true } } },
    }),
    prisma.product.findMany({ where: { userId } }),
    prisma.transaction.findMany({ where: { userId } }),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SosmedAI";
  workbook.created = new Date();

  const custSheet = workbook.addWorksheet("Pelanggan CRM");
  custSheet.columns = [
    { header: "Nama", key: "name", width: 25 },
    { header: "WhatsApp", key: "whatsappNumber", width: 20 },
    { header: "Segmen", key: "segment", width: 12 },
    { header: "Total Belanja", key: "totalSpend", width: 18 },
    { header: "Jumlah Chat", key: "chatCount", width: 14 },
    { header: "Terakhir Chat", key: "lastContactedAt", width: 22 },
    { header: "AI Context", key: "aiContext", width: 50 },
  ];
  custSheet.getRow(1).font = { bold: true };
  customers.forEach((c) => {
    custSheet.addRow({
      name: c.name,
      whatsappNumber: c.whatsappNumber,
      segment: c.segment,
      totalSpend: c.totalSpend,
      chatCount: c._count.chatHistory,
      lastContactedAt: c.lastContactedAt?.toLocaleString("id-ID") ?? "-",
      aiContext: c.aiContext ?? "",
    });
  });

  const prodSheet = workbook.addWorksheet("Produk & HPP");
  prodSheet.columns = [
    { header: "Produk", key: "name", width: 30 },
    { header: "Harga Jual", key: "sellingPrice", width: 18 },
    { header: "COGS", key: "cogs", width: 18 },
    { header: "Margin (%)", key: "marginPct", width: 14 },
  ];
  prodSheet.getRow(1).font = { bold: true };
  products.forEach((p) => {
    prodSheet.addRow({ name: p.name, sellingPrice: p.sellingPrice, cogs: p.cogs, marginPct: p.marginPct.toFixed(1) });
  });

  const txSheet = workbook.addWorksheet("Transaksi");
  txSheet.columns = [
    { header: "Order ID", key: "orderId", width: 30 },
    { header: "Nominal", key: "amount", width: 18 },
    { header: "Status", key: "status", width: 12 },
    { header: "Tanggal", key: "createdAt", width: 22 },
  ];
  txSheet.getRow(1).font = { bold: true };
  transactions.forEach((t) => {
    txSheet.addRow({ orderId: t.orderId, amount: t.amount, status: t.status, createdAt: t.createdAt.toLocaleString("id-ID") });
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const dateStr = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");

  await sendEmail({
    to: email,
    subject: `[SosmedAI] Backup Data Mingguan — ${dateStr}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#4f46e5">📊 Backup Mingguan SosmedAI</h2><p>Halo ${name ?? "Pemilik Toko"},</p><p>Terlampir backup data bisnis Anda per <strong>${dateStr}</strong>: ${customers.length} pelanggan, ${products.length} produk, ${transactions.length} transaksi.</p><p style="color:#6b7280;font-size:14px">Dikirim otomatis setiap Senin pagi.</p><hr/><p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} SosmedAI</p></div>`,
    attachments: [
      {
        filename: `backup-${dateStr}.xlsx`,
        content: buffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}
