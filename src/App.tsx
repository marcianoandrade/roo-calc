import { useEffect, useState } from 'react';
import { DefenseCalculator } from './components/DefenseCalculator';
import { cookiesEnabled, removeItem } from './lib/cookies';
import { LEGACY_COOKIE_KEYS } from './lib/persistence';

const ORIGINAL_URL = 'https://roo-calc.vercel.app/';
const REPO_URL = 'https://github.com/marcianoandrade/roo-calc';

export function App() {
  const [cookiesOk] = useState(() => cookiesEnabled());

  // Cookies written by earlier versions of this page (removed screens) are cleaned up once.
  useEffect(() => {
    LEGACY_COOKIE_KEYS.forEach(removeItem);
  }, []);

  return (
    <main className="ro-desktop">
      {!cookiesOk && (
        <p className="ro-alert" role="alert">
          Cookies are disabled in this browser, so inputs and saved snapshots will not persist between visits.
        </p>
      )}
      <DefenseCalculator />
      <footer className="ro-chat" aria-label="About this page">
        <p className="ro-chat-notice">
          [Notice] This page was created with inspiration from the original{' '}
          <a href={ORIGINAL_URL} target="_blank" rel="noreferrer">
            Defense Calculator (roo-calc.vercel.app)
          </a>
          .
        </p>
        <p className="ro-chat-sys">
          [System] Source code:{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            github.com/marcianoandrade/roo-calc
          </a>
        </p>
        <p>
          <small>Fan-made tool. Ragnarok Online and its artwork are © Gravity Co., Ltd. Not affiliated.</small>
        </p>
      </footer>
    </main>
  );
}
