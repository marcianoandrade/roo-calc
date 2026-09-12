import { intlTag, type Locale } from '../i18n';

const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(intlTag(locale), options);
    numberFormats.set(key, format);
  }
  return format;
}

function dateFormat(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(intlTag(locale), options);
    dateFormats.set(key, format);
  }
  return format;
}

/** Up to two decimals, locale grouping ("2,328.46" / "2.328,46"). */
export function formatNumber(value: number, locale: Locale = 'en'): string {
  return numberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

/** Exactly `decimals` decimals. */
export function formatFixed(value: number, decimals: number, locale: Locale = 'en'): string {
  return numberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function formatPercent(fraction: number, decimals = 2, locale: Locale = 'en'): string {
  return `${formatFixed(fraction * 100, decimals, locale)}%`;
}

export function formatDateTime(ms: number, locale: Locale = 'en'): string {
  return dateFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ms));
}

/** Value for an `<input type="datetime-local">`: local time as "YYYY-MM-DDTHH:mm". */
export function toDateTimeInputValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Reads that same layout back as local time; null when the text is not a real date. */
export function parseDateTimeInput(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour = '0', minute = '0'] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  // Date silently rolls over impossible days (2026-02-31 -> March 3), so check it back.
  if (date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return date.getTime();
}

export function formatAxisDate(ms: number, locale: Locale = 'en'): string {
  return dateFormat(locale, { day: '2-digit', month: '2-digit' }).format(new Date(ms));
}

/** Axis tick: full number below 10,000 ("2,328"), abbreviated above ("12.5k"). */
export function formatCompact(value: number, locale: Locale = 'en'): string {
  if (Math.abs(value) >= 10000) {
    return `${numberFormat(locale, { maximumFractionDigits: value % 1000 === 0 ? 0 : 1 }).format(value / 1000)}k`;
  }
  return formatNumber(value, locale);
}
