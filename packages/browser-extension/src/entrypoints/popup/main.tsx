import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import { PopupApp } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('[popup] Root container #root not found');
}

createRoot(container).render(<PopupApp />);
