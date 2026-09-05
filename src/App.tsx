import { useState } from 'react';
import { DefenseCalculator } from './components/DefenseCalculator';
import { PvpCounterLab } from './components/PvpCounterLab';
import { cookiesEnabled } from './lib/cookies';
import { useCookieState } from './lib/history';
import { COOKIE_KEYS, decodeTab, encodeTab, type TabId } from './lib/persistence';

export function App() {
  const [tab, setTab] = useCookieState<TabId>(COOKIE_KEYS.tab, 'calculator', encodeTab, decodeTab);
  const [cookiesOk] = useState(() => cookiesEnabled());

  return (
    <main className="page-shell">
      {!cookiesOk && (
        <p className="cookie-warning" role="alert">
          Cookies are disabled in this browser, so inputs and saved snapshots will not persist between visits.
        </p>
      )}
      <nav className="top-tabs" aria-label="Main navigation tabs">
        <button
          type="button"
          className={`top-tab ${tab === 'calculator' ? 'top-tab-active' : ''}`}
          onClick={() => setTab('calculator')}
        >
          Defense Calculator
        </button>
        <button
          type="button"
          className={`top-tab ${tab === 'counter' ? 'top-tab-active' : ''}`}
          onClick={() => setTab('counter')}
        >
          PvP Counter Lab
        </button>
      </nav>
      {tab === 'calculator' && <DefenseCalculator />}
      {tab === 'counter' && <PvpCounterLab />}
    </main>
  );
}
