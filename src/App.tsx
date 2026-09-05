import { useEffect, useState } from 'react';
import { DefenseCalculator } from './components/DefenseCalculator';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useLocale } from './i18n/LocaleContext';
import { cookiesEnabled, removeItem } from './lib/cookies';
import { LEGACY_COOKIE_KEYS } from './lib/persistence';

const ORIGINAL_URL = 'https://roo-calc.vercel.app/';
const REPO_URL = 'https://github.com/marcianoandrade/roo-calc';

export function App() {
  const { t } = useLocale();
  const [cookiesOk] = useState(() => cookiesEnabled());

  // Cookies written by earlier versions of this page (removed screens) are cleaned up once.
  useEffect(() => {
    LEGACY_COOKIE_KEYS.forEach(removeItem);
  }, []);

  return (
    <main className="ro-desktop">
      <LanguageSwitcher />
      {!cookiesOk && (
        <p className="ro-alert" role="alert">
          {t.cookieWarning}
        </p>
      )}
      <DefenseCalculator />
      <footer className="ro-chat">
        <p className="ro-chat-notice">
          [Notice] {t.footer.notice}{' '}
          <a href={ORIGINAL_URL} target="_blank" rel="noreferrer">
            {t.footer.originalLink}
          </a>
          .
        </p>
        <p className="ro-chat-sys">
          [System] {t.footer.source}{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            github.com/marcianoandrade/roo-calc
          </a>
        </p>
        <p>
          <small>{t.footer.disclaimer}</small>
        </p>
      </footer>
    </main>
  );
}
