export function formatDecimal(num: number, decimals = 2): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: decimals,
  }).format(num)
}
