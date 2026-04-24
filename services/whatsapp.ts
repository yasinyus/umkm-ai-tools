// WhatsApp utility functions for SosmedAI

export interface WhatsAppLinkOptions {
  phone?: string;       // e.g. "6281234567890" (with country code, no +)
  caption?: string;
  imageUrl?: string;    // public image URL (not base64)
  catalogUrl?: string;  // public catalog page URL
  businessName?: string;
}

/**
 * Generate a WhatsApp deep link.
 * If phone is omitted, opens the share picker (user selects contact).
 */
export function generateWhatsAppLink(options: WhatsAppLinkOptions): string {
  const { phone, caption, imageUrl, catalogUrl, businessName } = options;

  const parts: string[] = [];

  if (businessName) parts.push(`*${businessName}*`);
  if (caption) parts.push(caption);
  if (imageUrl) parts.push(`\n🖼️ Gambar produk: ${imageUrl}`);
  if (catalogUrl) parts.push(`\n📋 Lihat katalog lengkap: ${catalogUrl}`);

  const message = parts.join("\n").trim();
  const encoded = encodeURIComponent(message);

  if (phone) {
    const clean = phone.replace(/\D/g, "");
    return `https://wa.me/${clean}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}

/**
 * Generate a shareable WA message for a catalog page.
 */
export function generateCatalogShareMessage(
  title: string,
  catalogUrl: string,
  waNumber?: string
): string {
  const message = [
    `✨ *${title}*`,
    `\nLihat katalog produk kami:`,
    catalogUrl,
    waNumber ? `\nHubungi kami: wa.me/${waNumber.replace(/\D/g, "")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return encodeURIComponent(message);
}

/**
 * Normalise an Indonesian phone number to WA format (628xxx).
 */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}
