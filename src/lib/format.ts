const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' });
const axisFormat = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: '2-digit' });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(fraction: number, decimals = 2): string {
  return `${(fraction * 100).toFixed(decimals)}%`;
}

export function formatDateTime(ms: number): string {
  return dateTimeFormat.format(new Date(ms));
}

export function formatAxisDate(ms: number): string {
  return axisFormat.format(new Date(ms));
}

/** Axis tick: full number below 10,000 ("2,328"), abbreviated above ("12.5k"). */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return numberFormat.format(value);
}
