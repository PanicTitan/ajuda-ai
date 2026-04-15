/**
 * @file src/main.tsx
 * @description Entry point of the application.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.tsx';
import '@/index.css';
import { registerSW } from 'virtual:pwa-register';

// Global variable to capture the PWA install prompt event if it fires early
(window as any).deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    (window as any).deferredPrompt = e;
    // Dispatch a custom event to notify the hook if it's already mounted
    window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
});

// Register service worker for PWA support
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
