const DEFAULT_CURRENCY = "INR";

function normalizeCurrency(currency?: string) {
  const value = currency?.trim().toUpperCase() || DEFAULT_CURRENCY;

  try {
    new Intl.NumberFormat("en-IN", {
      currency: value,
      style: "currency",
    });
    return value;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function formatMoney(paise?: number, currency?: string) {
  return new Intl.NumberFormat("en-IN", {
    currency: normalizeCurrency(currency),
    maximumFractionDigits: 0,
    style: "currency",
  }).format((paise ?? 0) / 100);
}

export function formatMoneyINR(paise?: number, currency = "INR") {
  return formatMoney(paise, currency);
}
