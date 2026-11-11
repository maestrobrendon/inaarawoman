import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { captureRefFromUrl } from './lib/affiliate';

// Creator links (?ref=CODE) — remember the code for checkout.
captureRefFromUrl();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
