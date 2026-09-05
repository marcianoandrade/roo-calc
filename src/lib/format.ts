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
