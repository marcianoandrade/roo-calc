import { en } from './en';
import { es } from './es';
import { ptBR } from './pt-BR';

export type Locale = 'en' | 'pt-BR' | 'es';

/** Shape of a dictionary; `en` is the reference. */
export type Messages = typeof en;

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: readonly { id: Locale; label: string; intl: string }[] = [
  { id: 'en', label: 'English', intl: 'en-US' },
  { id: 'pt-BR', label: 'Português', intl: 'pt-BR' },
  { id: 'es', label: 'Español', intl: 'es' },
];

export const MESSAGES: Record<Locale, Messages> = { en, 'pt-BR': ptBR, es };

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.id === value);
}

export function decodeLocale(raw: string): Locale | null {
  return isLocale(raw) ? raw : null;
}

export function encodeLocale(locale: Locale): string {
  return locale;
}

/** Maps a BCP 47 tag from the browser ("pt-BR", "es-MX", "en") to a supported locale. */
export function detectLocale(language: string | undefined): Locale {
  const lang = (language ?? '').toLowerCase();
  if (lang.startsWith('pt')) return 'pt-BR';
  if (lang.startsWith('es')) return 'es';
  return DEFAULT_LOCALE;
}

/** Tag handed to Intl formatters. */
export function intlTag(locale: Locale): string {
  return LOCALES.find((l) => l.id === locale)?.intl ?? 'en-US';
}
