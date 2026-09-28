const shekels = new Intl.NumberFormat("en-US", { style: "currency", currency: "ILS" });

/** Formats an amount in agorot (1/100 shekel) as e.g. "₪12.90". */
export function formatMoney(agorot: number): string {
  return shekels.format(agorot / 100);
}
