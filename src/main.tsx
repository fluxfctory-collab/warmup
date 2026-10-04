import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// production HTML is prerendered (scripts/prerender.mjs); dev is not
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
