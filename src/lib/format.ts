export function formatDate(input: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  try {
    const d = new Date(input);
    return new Intl.DateTimeFormat("id-ID", opts || { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return "-";
  }
}

export function formatPrice(value: number, currency: string = "IDR") {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `Rp ${Number(value||0).toLocaleString("id-ID")}`;
  }
}
