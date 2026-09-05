import type { Locale } from '../i18n';

/** Tiny inline flags (no external assets). Decorative: the button carries the accessible name. */
export function FlagIcon({ locale }: { locale: Locale }) {
  switch (locale) {
    case 'en':
      return (
        <svg viewBox="0 0 60 36" aria-hidden="true" focusable="false">
          <rect width="60" height="36" fill="#012169" />
          <path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" strokeWidth="7" />
          <path d="M0 0 L60 36 M60 0 L0 36" stroke="#c8102e" strokeWidth="3" />
          <path d="M30 0 V36 M0 18 H60" stroke="#fff" strokeWidth="11" />
          <path d="M30 0 V36 M0 18 H60" stroke="#c8102e" strokeWidth="6" />
        </svg>
      );
    case 'pt-BR':
      return (
        <svg viewBox="0 0 60 42" aria-hidden="true" focusable="false">
          <rect width="60" height="42" fill="#009c3b" />
          <path d="M30 5 L54 21 L30 37 L6 21 Z" fill="#ffdf00" />
          <circle cx="30" cy="21" r="9.5" fill="#002776" />
          <path d="M21.5 18.5 Q30 15.5 38.5 20.5" stroke="#fff" strokeWidth="1.8" fill="none" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false">
          <rect width="60" height="40" fill="#aa151b" />
          <rect y="10" width="60" height="20" fill="#f1bf00" />
        </svg>
      );
  }
}
