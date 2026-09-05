import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useCookieState } from '../lib/history';
import { COOKIE_KEYS } from '../lib/persistence';
import { decodeLocale, detectLocale, encodeLocale, MESSAGES, type Locale, type Messages } from './index';

interface LocaleValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Dictionary for the active locale. */
  t: Messages;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useCookieState<Locale>(
    COOKIE_KEYS.locale,
    detectLocale(typeof navigator === 'undefined' ? undefined : navigator.language),
    encodeLocale,
    decodeLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = MESSAGES[locale].pageTitle;
  }, [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t: MESSAGES[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside <LocaleProvider>');
  return value;
}
