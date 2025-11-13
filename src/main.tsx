import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useUserStore } from './store/authStore'; // Import useUserStore

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

function Main() {
  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Main />);
