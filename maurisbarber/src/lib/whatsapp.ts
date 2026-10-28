export function whatsappHref(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Customers type their phone however they like ("099 123 456", "99123456",
// already with the country code, ...). wa.me needs a plain international
// number with no spaces/dashes and no leading 0 after the country code.
export function normalizeUyPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("598")) return digits;
  if (digits.startsWith("0")) return `598${digits.slice(1)}`;
  return `598${digits}`;
}
