const numberFormatIN = new Intl.NumberFormat("en-IN");

export function formatNumberIN(value: number | undefined) {
  return numberFormatIN.format(value ?? 0);
}
