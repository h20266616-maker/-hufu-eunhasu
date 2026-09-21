import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root 요소를 찾을 수 없어요');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
