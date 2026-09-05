import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyBackground, pickBackground } from './lib/background';
import './styles.css';

applyBackground(document.body, pickBackground());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
