import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import './styles/global.css';
import { App } from './App';

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
