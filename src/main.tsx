import { Analytics } from '@vercel/analytics/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LocaleProvider } from './i18n/LocaleContext';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
    {/* Vercel Web Analytics (cookieless page views). Only on the production build: the
        script lives at /_vercel/insights on the hosted site, so it has nothing to load locally. */}
    {import.meta.env.PROD && <Analytics />}
  </StrictMode>,
);
